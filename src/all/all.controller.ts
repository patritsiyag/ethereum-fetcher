import { Controller, Get, BadRequestException } from '@nestjs/common';
import { AllService } from './all.service';
import {
  getAllTransactionsOperation,
  getAllTransactionsResponse,
  getAllTransactionsResponse401,
  getAllTransactionsResponse500,
} from './swagger.docs';
import { TransactionDto } from '../transactions/transactions.dto';

@Controller('all')
export class AllController {
  constructor(private readonly allService: AllService) {}

  @Get()
  @getAllTransactionsOperation
  @getAllTransactionsResponse
  @getAllTransactionsResponse401
  @getAllTransactionsResponse500
  async getAllTransactions(): Promise<{ transactions: TransactionDto[] }> {
    try {
      const transactions = await this.allService.getAllTransactions();
      return { transactions };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }
}
