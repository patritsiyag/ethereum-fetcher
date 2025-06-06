import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { EthereumService } from './eth.service';
import { TransactionDto } from '../transactions/transactions.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import {
  getTransactionsByHashesOperation,
  getTransactionsByHashesQuery,
  getTransactionsByHashesResponse,
  getTransactionsByHashesResponse400,
  getTransactionsByHashesResponse500,
  getTransactionsByRlpOperation,
  getTransactionsByRlpParam,
  getTransactionsByRlpResponse,
  getTransactionsByRlpResponse400,
  getTransactionsByRlpResponse500,
  jwtHeader,
} from './swagger.docs';

@Controller('eth')
export class EthereumController {
  constructor(private readonly ethereumService: EthereumService) {}

  @Get(':rlphex')
  @getTransactionsByRlpOperation
  @getTransactionsByRlpParam
  @getTransactionsByRlpResponse
  @getTransactionsByRlpResponse400
  @getTransactionsByRlpResponse500
  @jwtHeader
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
  @getTransactionsByHashesOperation
  @getTransactionsByHashesQuery
  @getTransactionsByHashesResponse
  @getTransactionsByHashesResponse400
  @getTransactionsByHashesResponse500
  @jwtHeader
  async getTransactions(
    @Query() query: GetTransactionsDto,
    @Headers('AUTH_TOKEN') authToken?: string,
  ): Promise<{ transactions: TransactionDto[] }> {
    const transactions = await this.ethereumService.getTransactionsByHashes(
      query.transactionHashes,
      authToken,
    );
    return { transactions };
  }
}
