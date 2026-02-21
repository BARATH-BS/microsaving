import { IsString, IsOptional } from 'class-validator';



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
