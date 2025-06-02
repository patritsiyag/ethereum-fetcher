import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TransactionDto, fromEntity } from '../transactions/transactions.dto';
import { TransactionTrackingService } from '../transactions/transaction-tracking.service';

/**
 * Service responsible for managing user-specific transaction data.
 * Provides functionality to retrieve transactions associated with a specific user.
 */
@Injectable()
export class MyService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private transactionTrackingService: TransactionTrackingService,
  ) {}

  /**
   * Retrieves all transactions associated with a specific user.
   * First validates the user's existence, then fetches their tracked transactions.
   * @param userId - The ID of the user whose transactions to retrieve
   * @returns Promise resolving to an array of TransactionDto objects
   * @throws UnauthorizedException if the user is not found
   */
  async getMyTransactions(userId: number): Promise<TransactionDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const transactions =
      await this.transactionTrackingService.getUserTransactions(userId);

    return transactions.map((tx) => fromEntity(tx));
  }
}
