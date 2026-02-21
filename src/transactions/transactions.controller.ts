import { Body, Controller, Post, ParseArrayPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ValidatorTransactionDto, FilterTransactionDto } from './dto/transaction.dto';
import { ExpenseItemDto } from './dto/expense-item.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post('parse')
    parse(@Body(new ParseArrayPipe({ items: ExpenseItemDto })) expenses: ExpenseItemDto[]) {
        return this.transactionsService.parse(expenses);
    }

    @Post('validator')
    validator(@Body() dto: ValidatorTransactionDto) {
        return this.transactionsService.validator(dto);
    }

    @Post('filter')
    filter(@Body() dto: FilterTransactionDto) {
        return this.transactionsService.filter(dto);
    }
}
