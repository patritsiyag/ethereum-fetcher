import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import {
  TransactionDto,
  toDto,
  toEntity,
  fromEntity,
} from '../transactions/transactions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { validate } from 'class-validator';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { TransactionTrackingService } from '../transactions/transaction-tracking.service';

/**
 * Service responsible for interacting with the Ethereum blockchain and managing transaction data.
 * Handles fetching, storing, and retrieving transaction information.
 */
@Injectable()
export class EthereumService {
  private provider: ethers.JsonRpcProvider;
  private readonly logger = new Logger(EthereumService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private transactionTrackingService: TransactionTrackingService,
  ) {
    this.provider = new ethers.JsonRpcProvider(process.env.ETH_NODE_URL);
  }

  /**
   * Extracts user ID from JWT token.
   * @param token - The JWT token containing user information
   * @returns Promise resolving to the user ID if token is valid, null otherwise
   */
  private async getUserFromToken(token: string): Promise<number | null> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number }>(token);
      return payload.sub;
    } catch (error) {
      this.logger.error('Failed to verify JWT token', error);
      return null;
    }
  }

  /**
   * Fetches transaction information for given transaction hashes.
   * First checks the database for existing transactions, then fetches missing ones from the blockchain.
   * Optionally tracks the transactions for an authenticated user.
   * @param hashes - Array of transaction hashes to fetch
   * @param authToken - Optional JWT token for user authentication
   * @returns Promise resolving to an array of TransactionDto objects
   */
  async getTransactionsByHashes(
    hashes: string[],
    authToken?: string,
  ): Promise<TransactionDto[]> {
    const dbTransactions = await this.transactionRepository.find({
      where: { transactionHash: In(hashes) },
    });
    const missingTransactions = hashes.filter(
      (hash) => !dbTransactions.find((tx) => tx.transactionHash === hash),
    );

    const blockchainData = await Promise.all(
      missingTransactions.map(async (hash) => {
        try {
          const [tx, receipt] = await Promise.all([
            this.provider.getTransaction(hash),
            this.provider.getTransactionReceipt(hash),
          ]);

          if (tx && receipt) {
            return await this.saveTransaction(tx, receipt);
          }
          return null;
        } catch (error) {
          this.logger.error(`Error fetching transaction ${hash}:`, error);
          return null;
        }
      }),
    );
    const allTransactions = hashes
      .map((hash) => {
        const dbTx = dbTransactions.find((tx) => tx.transactionHash === hash);
        if (dbTx) return dbTx;

        const blockchainIndex = missingTransactions.indexOf(hash);
        return blockchainIndex !== -1 ? blockchainData[blockchainIndex] : null;
      })
      .filter((tx): tx is Transaction => tx !== null);

    if (authToken) {
      const userId = await this.getUserFromToken(authToken);
      if (userId) {
        await this.transactionTrackingService.trackTransactionsForUser(
          userId,
          allTransactions,
        );
      }
    }
    return allTransactions.map((tx) => fromEntity(tx));
  }

  /**
   * Saves a transaction to the database after validation.
   * @param transaction - The transaction data from the blockchain
   * @param transactionReceipt - The transaction receipt from the blockchain
   * @returns Promise resolving to the saved Transaction entity
   * @throws Error if transaction data is invalid or saving fails
   */
  async saveTransaction(
    transaction: ethers.TransactionResponse,
    transactionReceipt: ethers.TransactionReceipt,
  ): Promise<Transaction> {
    if (!transaction || !transactionReceipt) {
      throw new Error('Invalid transaction data');
    }

    const tranDto = toDto(transaction, transactionReceipt);
    const errors = await validate(tranDto);
    if (errors.length) {
      this.logger.error('Transaction validation failed:', errors);
      throw new Error('Transaction validation failed');
    }

    try {
      return await this.transactionRepository.save(toEntity(tranDto));
    } catch (error) {
      this.logger.error('Failed to save transaction:', error);
      throw new Error('Failed to save transaction');
    }
  }

  /**
   * Decodes RLP-encoded transaction hashes and fetches their information.
   * @param rlphex - RLP-encoded hexadecimal string containing transaction hashes
   * @param authToken - Optional JWT token for user authentication
   * @returns Promise resolving to an array of TransactionDto objects
   * @throws Error if RLP decoding fails or data is invalid
   */
  async getTransactionsByRlpHex(
    rlphex: string,
    authToken?: string,
  ): Promise<TransactionDto[]> {
    try {
      const rlpBuffer = Buffer.from(rlphex, 'hex');
      this.logger.debug(`RLP buffer length: ${rlpBuffer.length}`);

      const decoded = ethers.decodeRlp(rlpBuffer);
      this.logger.debug(`Decoded RLP: ${JSON.stringify(decoded)}`);

      if (!Array.isArray(decoded)) {
        throw new Error(
          'Invalid RLP data: expected an array of transaction hashes',
        );
      }
      const hashes = decoded.map((hash) => {
        if (typeof hash !== 'string') {
          throw new Error('Invalid transaction hash in RLP data');
        }
        const asciiHex = hash.slice(2);
        const hexBytes = Buffer.from(asciiHex, 'hex');
        return hexBytes.toString('utf8');
      });
      return this.getTransactionsByHashes(hashes, authToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`RLP decoding error: ${message}`);
      throw new Error(`Failed to decode RLP data: ${message}`);
    }
  }
}
