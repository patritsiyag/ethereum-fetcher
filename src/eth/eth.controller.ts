import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { EthereumService } from './eth.service';
import { TransactionDto } from '../transactions/transactions.dto';
@Controller('eth')
export class EthereumController {
  constructor(private readonly ethereumService: EthereumService) {}

  @Get(':rlphex')
  async getTransactionsByRlpHex(
    @Param('rlphex') rlphex: string,
    @Headers('AUTH_TOKEN') authToken?: string,
  ): Promise<{ transactions: TransactionDto[] }> {
    if (!/^[a-fA-F0-9]+$/.test(rlphex)) {
      throw new Error('Invalid RLP hex string');
    }

    const transactions = await this.ethereumService.getTransactionsByRlpHex(
      rlphex,
      authToken,
    );
    return { transactions };
  }

  @Get()
  async getTransactions(
    @Query('transactionHashes') transactionHashes: string | string[],
    @Headers('AUTH_TOKEN') authToken?: string,
  ): Promise<{ transactions: TransactionDto[] }> {
    let hashes: string[];
    if (typeof transactionHashes === 'string') {
      try {
        const parsed: unknown = JSON.parse(transactionHashes);
        if (
          Array.isArray(parsed) &&
          parsed.every((h) => typeof h === 'string')
        ) {
          hashes = parsed;
        } else {
          hashes = [transactionHashes];
        }
      } catch {
        hashes = [transactionHashes];
      }
    } else {
      hashes = transactionHashes;
    }

    const transactions = await this.ethereumService.getTransactionsByHashes(
      hashes,
      authToken,
    );
    return { transactions };
  }
}
