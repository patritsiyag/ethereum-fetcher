import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transaction } from './entities/transaction.entity';

/**
 * Service responsible for tracking and managing user-transaction associations.
 * Handles the many-to-many relationship between users and transactions.
 */
@Injectable()
export class TransactionTrackingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Associates a list of transactions with a specific user.
   * Creates the many-to-many relationship between the user and their transactions.
   * @param userId - The ID of the user to associate transactions with
   * @param transactions - Array of transactions to associate with the user
   * @returns Promise resolving when the association is complete
   */
  async trackTransactionsForUser(
    userId: number,
    transactions: Transaction[],
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['transactions'],
    });

    if (!user) {
      return;
    }

    // Add new transactions to user's existing transactions
    user.transactions = [...user.transactions, ...transactions];
    await this.userRepository.save(user);
  }

  /**
   * Retrieves all transactions associated with a specific user.
   * @param userId - The ID of the user whose transactions to retrieve
   * @returns Promise resolving to an array of Transaction entities
   */
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['transactions'],
    });

    return user?.transactions || [];
  }
}
