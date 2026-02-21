import { IsDateString, IsNumber, Max, Min, IsNotEmpty } from 'class-validator';
import { APP_MESSAGES } from '../../utils/app.messages';

export class ExpenseItemDto {
  @IsNotEmpty({ message: APP_MESSAGES.TRANSACTIONS.PARSE.REQUIRED_DATE })
  @IsDateString({}, { message: APP_MESSAGES.TRANSACTIONS.PARSE.DATE_FORMAT })
  date: string;

  @IsNotEmpty({ message: APP_MESSAGES.TRANSACTIONS.PARSE.REQUIRED_AMOUNT })
  @IsNumber()
  @Min(0, { message: APP_MESSAGES.TRANSACTIONS.PARSE.AMOUNT_RANGE })
  @Max(499999, { message: APP_MESSAGES.TRANSACTIONS.PARSE.AMOUNT_RANGE }) // Constraint: x < 5 * 10^5
  amount: number;
}
