import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { ReturnsModule } from './returns/returns.module';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [TransactionsModule, ReturnsModule, PerformanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
