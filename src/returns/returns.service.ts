import { Injectable } from '@nestjs/common';
import { NpsReturnDto, IndexReturnDto, ReturnsBaseDto } from './dto/return.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { APP_CONSTANTS } from '../utils/app.constants';

@Injectable()
export class ReturnsService {
  constructor(private readonly transactionsService: TransactionsService) { }

  private calculateYearsToRetirement(age: number): number {
    return age < 60 ? 60 - age : 5;
  }

  private compoundInterest(
    principal: number,
    rate: number,
    years: number,
  ): number {
    return principal * Math.pow(1 + rate, years);
  }

  private adjustForInflation(
    amount: number,
    inflationRate: number,
    years: number,
  ): number {
    return amount / Math.pow(1 + inflationRate, years);
  }

  private calculateTaxBenefit(wage: number, invested: number): number {
    const { MAX_TAX_DEDUCTION, MAX_DEDUCTION_PERCENTAGE } =
      APP_CONSTANTS.RETURNS.NPS;

    // Annual income calculation per requirement
    const annualIncome = wage * 12;

    const maxDeductionBasedOnIncome = annualIncome * MAX_DEDUCTION_PERCENTAGE;
    const npsDeduction = Math.min(
      invested,
      maxDeductionBasedOnIncome,
      MAX_TAX_DEDUCTION,
    );

    const taxWithoutNps = this.calculateTax(annualIncome);
    const taxWithNps = this.calculateTax(annualIncome - npsDeduction);

    return parseFloat((taxWithoutNps - taxWithNps).toFixed(2));
  }

  private calculateTax(income: number): number {
    const taxableIncome = income;
    if (taxableIncome <= 0) return 0;

    let totalTax = 0;
    const slabs = APP_CONSTANTS.RETURNS.TAX_SLABS;

    let previousLimit = 0;
    for (const slab of slabs) {
      if (taxableIncome > previousLimit) {
        const amountInSlab = Math.min(
          taxableIncome - previousLimit,
          slab.limit - previousLimit,
        );
        totalTax += amountInSlab * slab.rate;
        previousLimit = slab.limit;
      } else {
        break;
      }
    }

    return totalTax;
  }

  private processReturns(
    dto: ReturnsBaseDto,
    interestRate: number,
    isNps: boolean,
  ) {
    // Parse raw transactions to compute initial ceiling and remanent
    const parsedTx = this.transactionsService.parse(dto.transactions);

    // Run the filter algorithm to apply P, Q, K rules
    const filterDto = {
      ...dto,
      transactions: parsedTx,
    };
    const filterResult = this.transactionsService.filter(filterDto);

    const validTransactions = filterResult.valid;

    // Output fields
    let totalTransactionAmount = 0;
    let totalCeiling = 0;

    for (const t of validTransactions) {
      totalTransactionAmount += t.amount;
      totalCeiling += t.ceiling;
    }

    const yearsToRetirement = this.calculateYearsToRetirement(dto.age);
    const realInflationRate = dto.inflation / 100;

    const savingsByDates: {
      start: string;
      end: string;
      amount: number;
      profit: number;
      taxBenefit: number;
    }[] = [];

    for (const kPeriod of dto.k) {
      const kStartMs = new Date(kPeriod.start).getTime();
      const kEndMs = new Date(kPeriod.end).getTime();

      // Find valid transactions in this k period
      const kTrans = validTransactions.filter((t) => {
        const tMs = new Date(t.date).getTime();
        return tMs >= kStartMs && tMs <= kEndMs && t.inKPeriod;
      });

      const investedAmount = kTrans.reduce((sum, t) => sum + t.remanent, 0);

      // Calculate Compound Interest
      const futureValue = this.compoundInterest(
        investedAmount,
        interestRate,
        yearsToRetirement,
      );

      // Adjust for inflation
      const realFutureValue = this.adjustForInflation(
        futureValue,
        realInflationRate,
        yearsToRetirement,
      );

      const profit = realFutureValue - investedAmount;

      let taxBenefit = 0;
      if (isNps) {
        taxBenefit = this.calculateTaxBenefit(dto.wage, investedAmount);
      }

      savingsByDates.push({
        start: kPeriod.start,
        end: kPeriod.end,
        amount: parseFloat(investedAmount.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        taxBenefit: parseFloat(taxBenefit.toFixed(2)),
      });
    }

    return {
      totalTransactionAmount: parseFloat(totalTransactionAmount.toFixed(2)),
      totalCeiling: parseFloat(totalCeiling.toFixed(2)),
      savingsByDates,
    };
  }

  nps(dto: NpsReturnDto) {
    return this.processReturns(
      dto,
      APP_CONSTANTS.RETURNS.NPS.INTEREST_RATE,
      true,
    );
  }

  index(dto: IndexReturnDto) {
    return this.processReturns(
      dto,
      APP_CONSTANTS.RETURNS.INDEX.INTEREST_RATE,
      false,
    );
  }
}
