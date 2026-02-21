import { IsString, IsOptional } from 'class-validator';

export class ParseTransactionDto {
    @IsString()
    @IsOptional()
    payload?: string;
}

export class ValidatorTransactionDto {
    @IsString()
    @IsOptional()
    payload?: string;
}

export class FilterTransactionDto {
    @IsString()
    @IsOptional()
    payload?: string;
}
