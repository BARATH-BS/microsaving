import { Injectable } from '@nestjs/common';
import { ValidatorRequestDto, FilterTransactionDto } from './dto/transaction.dto';
import { ExpenseItemDto } from './dto/expense-item.dto';
import { ParsedExpense } from './interfaces/parse.interface';
import { ValidTransaction, InvalidTransaction, ValidatorResult } from './interfaces/validator.interface';
import { APP_MESSAGES } from '../utils/app.messages';

@Injectable()
export class TransactionsService {
    parse(expenses: ExpenseItemDto[]): ParsedExpense[] {
        return expenses.map(expense => {
            // Next multiple of 100 (e.g., 100 -> 200, 1519 -> 1600)
            const ceiling = parseFloat((Math.floor(expense.amount / 100) * 100 + 100).toFixed(2));
            const remanent = parseFloat((ceiling - expense.amount).toFixed(2));

            return {
                date: expense.date,
                amount: expense.amount,
                ceiling,
                remanent,
            };
        });
    }

    validator(dto: ValidatorRequestDto): ValidatorResult {
        const { wage, transactions } = dto;
        const valid: ValidTransaction[] = [];
        const invalid: InvalidTransaction[] = [];

        const seen = new Map<string, boolean>();
        const duplicates: ValidTransaction[] = [];

        for (const t of transactions) {
            const item: ValidTransaction = {
                date: t.date,
                amount: t.amount,
                ceiling: t.ceiling,
                remanent: t.remanent,
            };

            if (t.amount < 0) {
                invalid.push({ ...item, message: APP_MESSAGES.TRANSACTIONS.VALIDATOR.NEGATIVE_AMOUNT });
            } else if (t.amount > wage) {
                invalid.push({ ...item, message: APP_MESSAGES.TRANSACTIONS.VALIDATOR.EXCEEDS_WAGE });
            } else {
                valid.push(item);

                // Detect duplicates among valid transactions: same date AND same amount
                const key = `${t.date}__${t.amount}`;
                if (seen.has(key)) {
                    if (!duplicates.some(d => `${d.date}__${d.amount}` === key)) {
                        duplicates.push(item);
                    }
                } else {
                    seen.set(key, true);
                }
            }
        }


        return { valid, invalid, duplicates };
    }

    filter(dto: FilterTransactionDto) {
        return { message: 'Filtered transaction dummy response', receivedDto: dto };
    }
}
