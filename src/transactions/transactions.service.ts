import { Injectable } from '@nestjs/common';
import { ParseTransactionDto, ValidatorTransactionDto, FilterTransactionDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
    parse(dto: ParseTransactionDto) {
        return { message: 'Parsed transaction dummy response', receivedDto: dto };
    }

    validator(dto: ValidatorTransactionDto) {
        return { message: 'Validated transaction dummy response', receivedDto: dto };
    }

    filter(dto: FilterTransactionDto) {
        return { message: 'Filtered transaction dummy response', receivedDto: dto };
    }
}
