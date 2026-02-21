import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/performance (GET)', () => {
    it('returns server metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/performance')
        .expect(200);
      expect(res.body).toHaveProperty('time');
      expect(typeof res.body.time).toBe('string');
      expect(res.body).toHaveProperty('memory');
      expect(typeof res.body.memory).toBe('string');
      expect(res.body.memory).toContain('MB');
      expect(res.body).toHaveProperty('threads');
      expect(typeof res.body.threads).toBe('number');
      expect(res.body.threads).toBeGreaterThanOrEqual(1);
    });
  });

  describe('/transactions/parse (POST)', () => {
    it('computes ceiling and remanent for expenses', async () => {
      const expenses = [
        { date: '2023-02-28 15:49:20', amount: 375 },
        { date: '2023-07-01 21:59:00', amount: 620 },
      ];
      const res = await request(app.getHttpServer())
        .post('/transactions/parse')
        .send(expenses)
        .expect(201);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toMatchObject({
        date: '2023-02-28 15:49:20',
        amount: 375,
        ceiling: 400,
        remanent: 25,
      });
      expect(res.body[1]).toMatchObject({
        date: '2023-07-01 21:59:00',
        amount: 620,
        ceiling: 700,
        remanent: 80,
      });
    });

    it('rejects non-array body', async () => {
      const body = { date: '2023-02-28 15:49:20', amount: 375 };
      await request(app.getHttpServer())
        .post('/transactions/parse')
        .send(body)
        .expect(400);
    });

    it('validates date format', async () => {
      const res = await request(app.getHttpServer())
        .post('/transactions/parse')
        .send([{ date: 'invalid-date', amount: 1 }])
        .expect(400);
      const messages = (res.body.message || []).join(' | ');
      expect(messages).toContain('Date must be a valid datetime string');
    });

    it('validates amount range', async () => {
      const res = await request(app.getHttpServer())
        .post('/transactions/parse')
        .send([{ date: '2023-02-28 15:49:20', amount: 500000 }])
        .expect(400);
      const messages = (res.body.message || []).join(' | ');
      expect(messages).toContain('Amount must be between 0 and 500,000');
    });

    it('validates required date field', async () => {
      const res = await request(app.getHttpServer())
        .post('/transactions/parse')
        .send([{ amount: 10 }])
        .expect(400);
      const messages = (res.body.message || []).join(' | ');
      expect(messages).toContain('Date is required');
    });
  });

  describe('/transactions/validator (POST)', () => {
    it('validates transactions and detects invalids and duplicates', async () => {
      const dto = {
        wage: 500,
        transactions: [
          {
            date: '2023-03-10 10:00:00',
            amount: 250,
            ceiling: 300,
            remanent: 50,
          }, // valid
          {
            date: '2023-03-10 10:00:00',
            amount: 250,
            ceiling: 300,
            remanent: 50,
          }, // duplicate
          {
            date: '2023-04-11 09:15:00',
            amount: 600,
            ceiling: 700,
            remanent: 100,
          }, // exceeds wage
          { date: '2023-05-12 08:05:00', amount: -10, ceiling: 0, remanent: 0 }, // negative
        ],
      };
      const res = await request(app.getHttpServer())
        .post('/transactions/validator')
        .send(dto)
        .expect(201);

      const { valid, invalid, duplicates } = res.body;
      expect(Array.isArray(valid)).toBe(true);
      expect(Array.isArray(invalid)).toBe(true);
      expect(Array.isArray(duplicates)).toBe(true);

      expect(valid.length).toBe(2); // first occurrence + the 600 amount is invalid, -10 invalid
      expect(duplicates.length).toBe(1);
      const invalidMsgs = invalid.map((i: any) => i.message).sort();
      expect(invalidMsgs).toEqual(
        [
          'Amount exceeds the maximum allowed investment based on wage',
          'Negative amounts are not allowed',
        ].sort(),
      );
    });
  });

  describe('/transactions/filter (POST)', () => {
    it('applies Q, P, and K rules and flags invalids', async () => {
      const dto = {
        q: [
          {
            fixed: 100,
            start: '2023-07-01 00:00:00',
            end: '2023-07-31 23:59:59',
          },
        ],
        p: [
          {
            extra: 25,
            start: '2023-07-15 00:00:00',
            end: '2023-12-31 23:59:59',
          },
        ],
        k: [{ start: '2023-01-01 00:00:00', end: '2023-12-31 23:59:59' }],
        transactions: [
          { date: '2023-07-20 12:00:00', amount: 250 }, // in Q and P and K
          { date: '2023-07-20 12:00:00', amount: 250 }, // duplicate
          { date: '2023-02-10 10:00:00', amount: -5 }, // negative
          { date: '2023-03-10 10:00:00', amount: 100 }, // valid in K only
        ],
      };

      const res = await request(app.getHttpServer())
        .post('/transactions/filter')
        .send(dto)
        .expect(201);

      const { valid, invalid } = res.body;
      expect(Array.isArray(valid)).toBe(true);
      expect(Array.isArray(invalid)).toBe(true);

      // Expect two invalids: negative and duplicate
      expect(invalid.length).toBe(2);
      const invalidMsgs = invalid.map((i: any) => i.message).sort();
      expect(invalidMsgs).toEqual(
        ['Duplicate transaction', 'Negative amounts are not allowed'].sort(),
      );

      // Valid entries should include remanent adjustments and K flag
      const v0 = valid.find((v: any) => v.date === '2023-07-20 12:00:00');
      expect(v0).toBeDefined();
      expect(v0.remanent).toBe(125); // Q fixed 100 + P extra 25
      expect(v0.inKPeriod).toBe(true);

      const v1 = valid.find((v: any) => v.date === '2023-03-10 10:00:00');
      expect(v1).toBeDefined();
      expect(v1.remanent).toBe(0); // no Q/P applies
      expect(v1.inKPeriod).toBe(true);
    });

    it('uses latest-start Q period when multiple match', async () => {
      const dto = {
        q: [
          { fixed: 10, start: '2023-01-01 00:00:00', end: '2023-12-31 23:59:59' },
          { fixed: 50, start: '2023-06-01 00:00:00', end: '2023-12-31 23:59:59' },
        ],
        p: [],
        k: [{ start: '2023-01-01 00:00:00', end: '2023-12-31 23:59:59' }],
        transactions: [{ date: '2023-07-10 10:00:00', amount: 100 }],
      };
      const res = await request(app.getHttpServer())
        .post('/transactions/filter')
        .send(dto)
        .expect(201);
      const v = res.body.valid.find((x: any) => x.date === '2023-07-10 10:00:00');
      expect(v.remanent).toBe(50);
    });

    it('treats P period end as inclusive', async () => {
      const dto = {
        q: [],
        p: [{ extra: 25, start: '2023-01-01 00:00:00', end: '2023-01-31 23:59:59' }],
        k: [],
        transactions: [{ date: '2023-01-31 23:59:59', amount: 100 }],
      };
      const res = await request(app.getHttpServer())
        .post('/transactions/filter')
        .send(dto)
        .expect(201);
      const v = res.body.valid[0];
      expect(v.remanent).toBe(25);
    });

    it('flags inKPeriod only within ranges', async () => {
      const dto = {
        q: [],
        p: [],
        k: [{ start: '2023-03-01 00:00:00', end: '2023-03-31 23:59:59' }],
        transactions: [
          { date: '2023-02-28 23:59:59', amount: 100 },
          { date: '2023-03-15 12:00:00', amount: 100 },
          { date: '2023-04-01 00:00:00', amount: 100 },
        ],
      };
      const res = await request(app.getHttpServer())
        .post('/transactions/filter')
        .send(dto)
        .expect(201);
      const flags = res.body.valid.map((v: any) => v.inKPeriod);
      expect(flags).toEqual([false, true, false]);
    });
  });

  describe('/returns/nps (POST)', () => {
    it('computes NPS returns with tax benefit', async () => {
      const dto = {
        age: 29,
        wage: 100000,
        inflation: 5.5,
        q: [
          {
            fixed: 0,
            start: '2023-07-01 00:00:00',
            end: '2023-07-31 23:59:59',
          },
        ],
        p: [
          {
            extra: 25,
            start: '2023-10-01 08:00:00',
            end: '2023-12-31 19:59:59',
          },
        ],
        k: [
          { start: '2023-01-01 00:00:00', end: '2023-12-31 23:59:59' },
          { start: '2023-03-01 00:00:00', end: '2023-11-31 23:59:59' },
        ],
        transactions: [
          { date: '2023-02-28 15:49:20', amount: 375 },
          { date: '2023-07-01 21:59:00', amount: 620 },
          { date: '2023-10-12 20:15:30', amount: 250 },
          { date: '2023-12-17 08:09:45', amount: 480 },
          { date: '2023-12-17 08:09:45', amount: -10 },
        ],
      };

      const res = await request(app.getHttpServer())
        .post('/returns/nps')
        .send(dto)
        .expect(201);

      const body = res.body;
      expect(body).toHaveProperty('totalTransactionAmount');
      expect(typeof body.totalTransactionAmount).toBe('number');
      expect(body).toHaveProperty('totalCeiling');
      expect(typeof body.totalCeiling).toBe('number');
      expect(body).toHaveProperty('savingsByDates');
      expect(Array.isArray(body.savingsByDates)).toBe(true);
      expect(body.savingsByDates.length).toBe(dto.k.length);
      for (const entry of body.savingsByDates) {
        expect(entry).toHaveProperty('start');
        expect(entry).toHaveProperty('end');
        expect(entry).toHaveProperty('amount');
        expect(entry).toHaveProperty('profit');
        expect(entry).toHaveProperty('taxBenefit');
        expect(typeof entry.taxBenefit).toBe('number');
      }
      const someBenefit = body.savingsByDates.some((e: any) => e.taxBenefit > 0);
      expect(someBenefit).toBe(true);
    });

  });
  describe('/returns/index (POST)', () => {
    it('computes Index returns with zero tax benefit', async () => {
      const dto = {
        age: 29,
        wage: 50000,
        inflation: 5.5,
        q: [
          {
            fixed: 0,
            start: '2023-07-01 00:00:00',
            end: '2023-07-31 23:59:59',
          },
        ],
        p: [
          {
            extra: 25,
            start: '2023-10-01 08:00:00',
            end: '2023-12-31 19:59:59',
          },
        ],
        k: [{ start: '2023-01-01 00:00:00', end: '2023-12-31 23:59:59' }],
        transactions: [
          { date: '2023-02-28 15:49:20', amount: 375 },
          { date: '2023-07-01 21:59:00', amount: 620 },
        ],
      };

      const res = await request(app.getHttpServer())
        .post('/returns/index')
        .send(dto)
        .expect(201);

      const body = res.body;
      expect(body).toHaveProperty('savingsByDates');
      expect(Array.isArray(body.savingsByDates)).toBe(true);
      for (const entry of body.savingsByDates) {
        expect(entry).toHaveProperty('taxBenefit');
        expect(entry.taxBenefit).toBe(0);
      }
    });
  });
});
