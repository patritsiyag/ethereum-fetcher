import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionTrackingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async trackTransactionsForUser(
    userId: number,
    transactions: Transaction[],
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['transactions'],
    });

    if (!user) return;

    const existingTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.users', 'user', 'user.id = :userId', {
        userId: user.id,
      })
      .getMany();

    user.transactions = [...existingTransactions, ...transactions];
    await this.userRepository.save(user);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['transactions'],
    });

    return user?.transactions || [];
  }
}
