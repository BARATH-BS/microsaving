import { Injectable } from '@nestjs/common';
import { ValidatorTransactionDto, FilterTransactionDto } from './dto/transaction.dto';
import { ExpenseItemDto } from './dto/expense-item.dto';
import { ParsedExpense } from './interfaces/parse.interface';

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

    validator(dto: ValidatorTransactionDto) {
        return { message: 'Validated transaction dummy response', receivedDto: dto };
    }

    filter(dto: FilterTransactionDto) {
        return { message: 'Filtered transaction dummy response', receivedDto: dto };
    }
}
