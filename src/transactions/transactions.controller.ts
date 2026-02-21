import { Body, Controller, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ParseTransactionDto, ValidatorTransactionDto, FilterTransactionDto } from './dto/transaction.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post('parse')
    parse(@Body() dto: ParseTransactionDto) {
        return this.transactionsService.parse(dto);
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
