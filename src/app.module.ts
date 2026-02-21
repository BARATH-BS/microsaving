import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { ReturnsModule } from './returns/returns.module';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [TransactionsModule, ReturnsModule, PerformanceModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
