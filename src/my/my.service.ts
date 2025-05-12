import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TransactionDto, fromEntity } from '../transactions/transactions.dto';
import { TransactionTrackingService } from '../transactions/transaction-tracking.service';

@Injectable()
export class MyService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private transactionTrackingService: TransactionTrackingService,
  ) {}

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
