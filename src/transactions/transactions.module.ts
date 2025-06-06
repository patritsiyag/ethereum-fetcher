import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionTrackingService } from './transaction-tracking.service';
import { User } from '../users/entities/user.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction])],
  providers: [TransactionTrackingService],
  exports: [TransactionTrackingService],
})
export class TransactionsModule {}
