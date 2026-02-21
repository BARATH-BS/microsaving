import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRequestDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QPeriodDto)
    q: QPeriodDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PPeriodDto)
    p: PPeriodDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => KPeriodDto)
    k: KPeriodDto[];

    @IsOptional()
    @IsNumber()
    @IsPositive()
    wage?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FilterTransactionDto)
    transactions: FilterTransactionDto[];
}


export class FilterTransactionDto {
    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    ceiling: number;

    @IsNotEmpty()
    @IsNumber()
    remanent: number;
}


export class PPeriodDto {
    @IsNumber()
    @Min(0)
    extra: number;

    @IsNotEmpty()
    @IsDateString()
    start: string;

    @IsNotEmpty()
    @IsDateString()
    end: string;
}


export class KPeriodDto {
    @IsNotEmpty()
    @IsDateString()
    start: string;

    @IsNotEmpty()
    @IsDateString()
    end: string;
}


export class QPeriodDto {
    @IsNumber()
    @Min(0)
    fixed: number;

    @IsNotEmpty()
    @IsDateString()
    start: string;

    @IsNotEmpty()
    @IsDateString()
    end: string;
}