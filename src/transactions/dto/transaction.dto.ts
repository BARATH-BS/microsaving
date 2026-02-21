import { IsNumber, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionItemDto } from './transaction-item.dto';

export class ValidatorRequestDto {
    @IsNumber()
    @IsPositive({ message: 'Wage must be a positive number' })
    wage: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TransactionItemDto)
    transactions: TransactionItemDto[];
}

export class FilterTransactionDto {
    payload?: string;
}
