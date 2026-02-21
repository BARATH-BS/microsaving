import { Injectable } from '@nestjs/common';
import {
  ValidatorRequestDto,
  FilterTransactionDto,
} from './dto/transaction.dto';
import { FilterRequestDto } from './dto/filter-request.dto';
import { ExpenseItemDto } from './dto/expense-item.dto';
import { ParsedExpense } from './interfaces/parse.interface';
import {
  ValidTransaction,
  InvalidTransaction,
  ValidatorResult,
} from './interfaces/validator.interface';
import {
  FilterValidTransaction,
  FilterInvalidTransaction,
  FilterResult,
} from './interfaces/filter.interface';
import { APP_MESSAGES } from '../utils/app.messages';

// ─── Binary search helpers ────────────────────────────────────────────────────
/** First index i such that arr[i] >= target */
function lowerBound(arr: number[], target: number): number {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** First index i such that arr[i] > target */
function upperBound(arr: number[], target: number): number {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

@Injectable()
export class TransactionsService {
  parse(expenses: ExpenseItemDto[]): ParsedExpense[] {
    return expenses.map((expense) => {
      const ceiling = Math.floor(expense.amount / 100) * 100 + 100;
      const remanent = Math.round((ceiling - expense.amount) * 100) / 100;
      return { date: expense.date, amount: expense.amount, ceiling, remanent };
    });
  }

  validator(dto: ValidatorRequestDto): ValidatorResult {
    const { wage, transactions } = dto;
    const valid: ValidTransaction[] = [];
    const invalid: InvalidTransaction[] = [];
    const seen = new Set<string>();
    const dupSet = new Set<string>();
    const duplicates: ValidTransaction[] = [];

    for (const t of transactions) {
      const item: ValidTransaction = {
        date: t.date,
        amount: t.amount,
        ceiling: t.ceiling,
        remanent: t.remanent,
      };

      if (t.amount < 0) {
        invalid.push({
          ...item,
          message: APP_MESSAGES.TRANSACTIONS.VALIDATOR.NEGATIVE_AMOUNT,
        });
      } else if (t.amount > wage) {
        invalid.push({
          ...item,
          message: APP_MESSAGES.TRANSACTIONS.VALIDATOR.EXCEEDS_WAGE,
        });
      } else {
        valid.push(item);

        const key = `${t.date}__${t.amount}`;
        if (seen.has(key)) {
          if (!dupSet.has(key)) {
            dupSet.add(key);
            duplicates.push(item);
          }
        } else {
          seen.add(key);
        }
      }
    }

    return { valid, invalid, duplicates };
  }

  filter(dto: FilterRequestDto): FilterResult {
    const n = dto.transactions.length;
    const invalid: FilterInvalidTransaction[] = [];

    // ── Step 1: detect negatives + duplicates in one pass ─────────────────
    // Working copies — never mutate input DTOs
    const candidates: FilterValidTransaction[] = [];
    const seen = new Map<string, true>();

    for (let i = 0; i < n; i++) {
      const t = dto.transactions[i];
      if (t.amount < 0) {
        invalid.push({
          date: t.date,
          amount: t.amount,
          message: APP_MESSAGES.TRANSACTIONS.FILTER.NEGATIVE_AMOUNT,
        });
        continue;
      }
      const key = `${t.date}__${t.amount}`;
      if (seen.has(key)) {
        invalid.push({
          date: t.date,
          amount: t.amount,
          message: APP_MESSAGES.TRANSACTIONS.FILTER.DUPLICATE,
        });
      } else {
        seen.set(key, true);
        candidates.push({
          date: t.date,
          amount: t.amount,
          ceiling: t.ceiling ?? 0,
          remanent: t.remanent ?? 0,
          inKPeriod: false,
        });
      }
    }

    const m = candidates.length;
    if (m === 0) return { valid: candidates, invalid };

    // Pre-compute candidate timestamps once (avoid repeated Date.parse in loops)
    const candidateMs = new Array<number>(m);
    for (let i = 0; i < m; i++) {
      candidateMs[i] = new Date(candidates[i].date).getTime();
    }

    // ── Step 2: Q rule — Priority Queue (sort by latest start, stable) ────
    // Pre-compute q timestamps
    if (dto.q.length > 0) {
      const sortedQ = dto.q
        .map((q, idx) => ({
          fixed: q.fixed,
          startMs: new Date(q.start).getTime(),
          endMs: new Date(q.end).getTime(),
          idx,
        }))
        .sort((a, b) =>
          a.startMs !== b.startMs ? b.startMs - a.startMs : a.idx - b.idx,
        );

      for (let i = 0; i < m; i++) {
        const tMs = candidateMs[i];
        for (const q of sortedQ) {
          if (tMs >= q.startMs && tMs <= q.endMs) {
            candidates[i].remanent = q.fixed;
            break; // Priority: first match in sorted order wins
          }
        }
      }
    }

    // ── Step 3: P rule — Sweep-Line (additive extras) ─────────────────────
    if (dto.p.length > 0) {
      // Build open/close events
      interface PEvent {
        ts: number;
        delta: number;
      }
      const events: PEvent[] = [];
      for (const p of dto.p) {
        events.push({ ts: new Date(p.start).getTime(), delta: p.extra });
        events.push({ ts: new Date(p.end).getTime() + 1, delta: -p.extra }); // +1ms → exclusive close
      }
      events.sort((a, b) => a.ts - b.ts);

      // Sort candidate indices by timestamp for sweep (don't reorder candidates array)
      const order = Array.from({ length: m }, (_, i) => i).sort(
        (a, b) => candidateMs[a] - candidateMs[b],
      );

      let evtIdx = 0;
      let activeExtra = 0;
      for (const ci of order) {
        const tMs = candidateMs[ci];
        while (evtIdx < events.length && events[evtIdx].ts <= tMs) {
          activeExtra += events[evtIdx].delta;
          evtIdx++;
        }
        candidates[ci].remanent += activeExtra;
      }
    }

    // ── Step 4: K rule — Binary Search (inKPeriod flag) ───────────────────
    if (dto.k.length > 0) {
      // Sorted timestamps for binary search
      const sortedMs = [...candidateMs].sort((a, b) => a - b);
      // Map timestamp → index in candidates array for O(1) flag setting
      const tsToIdx = new Map<number, number>();
      for (let i = 0; i < m; i++) tsToIdx.set(candidateMs[i], i);

      for (const k of dto.k) {
        const kStart = new Date(k.start).getTime();
        const kEnd = new Date(k.end).getTime();
        const lo = lowerBound(sortedMs, kStart);
        const hi = upperBound(sortedMs, kEnd);
        for (let j = lo; j < hi; j++) {
          const ci = tsToIdx.get(sortedMs[j]);
          if (ci !== undefined) candidates[ci].inKPeriod = true;
        }
      }
    }

    return { valid: candidates, invalid };
  }
}
