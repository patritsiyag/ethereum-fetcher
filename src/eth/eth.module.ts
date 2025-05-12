import { Module } from '@nestjs/common';
import { EthereumController } from './eth.controller';
import { EthereumService } from './eth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from 'src/users/entities/user.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User]), TransactionsModule],
  controllers: [EthereumController],
  providers: [EthereumService],
  exports: [EthereumService],
})
export class EthModule {}
