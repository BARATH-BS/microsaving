import { Body, Controller, Post, ParseArrayPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ValidatorRequestDto } from './dto/transaction.dto';
import { ExpenseItemDto } from './dto/expense-item.dto';
import { FilterRequestDto } from './dto/filter-request.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post('parse')
    parse(@Body(new ParseArrayPipe({ items: ExpenseItemDto })) expenses: ExpenseItemDto[]) {
        return this.transactionsService.parse(expenses);
    }

    @Post('validator')
    validator(@Body() dto: ValidatorRequestDto) {
        return this.transactionsService.validator(dto);
    }

    @Post('filter')
    filter(@Body() dto: FilterRequestDto) {
        return this.transactionsService.filter(dto);
    }
}
