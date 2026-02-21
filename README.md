# Microsaving

NestJS service for microsavings: transaction parsing, validation, filtering (Q/P/K rules), and returns calculations (NPS/Index). Uses Fastify and global validation.

## Setup
See the detailed [Setup Guide](./docs/setup.md) for manual and Docker instructions.

Quick start (manual):
```bash
npm ci
npm run start:dev
# App on http://localhost:5477/blackrock/challenge/v1
```

Docker (Compose):
```bash
docker compose up -d
# App on http://localhost:5477/blackrock/challenge/v1
```

## API
Base path: `/blackrock/challenge/v1`

- `GET /performance`
- `POST /transactions/parse`
- `POST /transactions/validator`
- `POST /transactions/filter`
- `POST /returns/nps`
- `POST /returns/index`

## Scripts
- Build: `npm run build`
- Dev: `npm run start:dev`
- Prod: `npm run start:prod`
- Lint: `npm run lint`
- Format: `npm run format`
- Tests: `npm test` (e2e config)
- Coverage: `npm run test:cov`

## Notes
- Default port is `5477`
