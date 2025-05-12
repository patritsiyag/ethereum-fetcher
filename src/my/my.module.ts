import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyController } from './my.controller';
import { MyService } from './my.service';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { EthModule } from '../eth/eth.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction]),
    EthModule,
    TransactionsModule,
  ],
  controllers: [MyController],
  providers: [MyService],
})
export class MyModule {}
