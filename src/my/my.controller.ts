import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { MyService } from './my.service';
import { TransactionDto } from '../transactions/transactions.dto';
import { AuthGuard } from '../auth/auth.guard';

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
  async getMyTransactions(
    @Request() req: RequestWithUser,
  ): Promise<{ transactions: TransactionDto[] }> {
    const transactions = await this.myService.getMyTransactions(req.user.sub);
    return { transactions };
  }
}
