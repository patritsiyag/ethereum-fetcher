import { Controller, Get } from '@nestjs/common';
import { AllService } from './all.service';
import { TransactionDto } from '../transactions/transactions.dto';

@Controller('all')
export class AllController {
  constructor(private readonly allService: AllService) {}

  @Get()
  async getAllTransactions(): Promise<{ transactions: TransactionDto[] }> {
    const transactions = await this.allService.getAllTransactions();
    return { transactions };
  }
}
