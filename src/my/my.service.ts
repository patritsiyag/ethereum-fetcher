import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TransactionDto, fromEntity } from '../transactions/transactions.dto';

/**
 * Service responsible for managing user-specific transaction data.
 * Provides functionality to retrieve transactions associated with a specific user.
 */
@Injectable()
export class MyService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      relations: ['transactions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user.transactions.map((tx) => fromEntity(tx));
  }
}
