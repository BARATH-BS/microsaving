import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class TransactionItemDto {
  @IsNotEmpty({ message: 'Date is required' })
  @IsDateString({}, { message: 'Date must be a valid datetime string' })
  date: string;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber()
  amount: number;

  @IsNotEmpty({ message: 'Ceiling is required' })
  @IsNumber()
  ceiling: number;

  @IsNotEmpty({ message: 'Remanent is required' })
  @IsNumber()
  remanent: number;
}
