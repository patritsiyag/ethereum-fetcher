import {
  Controller,
  Get,
  UseGuards,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { MyService } from './my.service';
import { AuthGuard } from '../auth/auth.guard';
import { TransactionDto } from '../transactions/transactions.dto';
import {
  getMyTransactionsOperation,
  getMyTransactionsResponse,
  getMyTransactionsResponse401,
  getMyTransactionsResponse404,
  getMyTransactionsResponse500,
} from './swagger.docs';

interface RequestWithUser extends Request {
  user: {
    username: string;
    sub: number;
  };
}

@Controller('my')
@UseGuards(AuthGuard)
export class MyController {
  constructor(private readonly myService: MyService) {}

  @Get()
  @getMyTransactionsOperation
  @getMyTransactionsResponse
  @getMyTransactionsResponse401
  @getMyTransactionsResponse404
  @getMyTransactionsResponse500
  async getMyTransactions(
    @Request() req: RequestWithUser,
  ): Promise<{ transactions: TransactionDto[] }> {
    try {
      const transactions = await this.myService.getMyTransactions(req.user.sub);
      return { transactions };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }
}
