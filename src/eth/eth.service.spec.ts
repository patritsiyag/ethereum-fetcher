// src/eth/eth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EthereumService } from './eth.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { TransactionTrackingService } from '../transactions/transaction-tracking.service';
import { TransactionResponse } from 'ethers';
import { TransactionReceipt } from 'ethers';
import { Provider, Block, OrphanFilter } from 'ethers';
import * as classValidator from 'class-validator';
import * as ethersLib from 'ethers';
import { ValidationError } from 'class-validator';

interface MockTransactionEntity {
  transactionHash: string;
  transactionStatus: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string | null;
  contractAddress: string | null;
  logsCount: number;
  input: string;
  value: string;
  users: User[];
}

interface MockToDtoFunction {
  (...args: unknown[]): unknown;
  mockReturnValue: (value: unknown) => void;
}

let toDtoMock = jest.fn() as MockToDtoFunction;

jest.mock('../transactions/transactions.dto', () => ({
  fromEntity: jest.fn((entity: MockTransactionEntity) => {
    if (!entity) return null;
    return {
      transactionHash: entity.transactionHash,
      transactionStatus: entity.transactionStatus,
      blockHash: entity.blockHash,
      blockNumber: entity.blockNumber,
      from: entity.from,
      to: entity.to,
      contractAddress: entity.contractAddress,
      logsCount: entity.logsCount,
      input: entity.input,
      value: entity.value,
    };
  }),
  toDto: (...args: unknown[]) => toDtoMock(...args),
  toEntity: jest.fn(),
}));

describe('EthereumService', () => {
  let service: EthereumService;
  let transactionRepository: Repository<Transaction>;
  let jwtService: JwtService;
  let transactionTrackingService: TransactionTrackingService;

  const mockTransactions: Transaction[] = [
    {
      transactionHash: '0x123',
      transactionStatus: 1,
      blockHash: '0xabc',
      blockNumber: 12345,
      from: '0xsender',
      to: '0xreceiver',
      contractAddress: null,
      logsCount: 2,
      input: '0xdata',
      value: '1000000000000000000',
      users: [],
    },
    {
      transactionHash: '0x456',
      transactionStatus: 0,
      blockHash: '0xdef',
      blockNumber: 67890,
      from: '0xsender2',
      to: null,
      contractAddress: '0xcontract',
      logsCount: 0,
      input: '0xcreateContract',
      value: '0',
      users: [],
    },
  ];

  const mockTx: Partial<TransactionResponse> = {
    hash: '0x789',
    from: '0xsender3',
    to: '0xreceiver3',
    data: '0xcalldata',
    value: BigInt('500000000000000000'),
    blockHash: '0xghi',
    blockNumber: 54321,
  };

  const mockReceipt: Partial<TransactionReceipt> = {
    status: 1,
    blockHash: '0xghi',
    blockNumber: 54321,
    contractAddress: null,
    logs: [
      {
        provider: {} as unknown as Provider,
        transactionHash: '0x789',
        blockHash: '0xghi',
        blockNumber: 54321,
        removed: false,
        address: '0xcontract',
        data: '0x',
        topics: [],
        index: 0,
        transactionIndex: 0,
        toJSON: () => ({}),
        getBlock: () => Promise.resolve({} as unknown as Block),
        getTransaction: () =>
          Promise.resolve({} as unknown as TransactionResponse),
        getTransactionReceipt: () =>
          Promise.resolve({} as unknown as TransactionReceipt),
        removedEvent: () => ({}) as unknown as OrphanFilter,
      },
      {
        provider: {} as unknown as Provider,
        transactionHash: '0x789',
        blockHash: '0xghi',
        blockNumber: 54321,
        removed: false,
        address: '0xcontract',
        data: '0x',
        topics: [],
        index: 1,
        transactionIndex: 0,
        toJSON: () => ({}),
        getBlock: () => Promise.resolve({} as unknown as Block),
        getTransaction: () =>
          Promise.resolve({} as unknown as TransactionResponse),
        getTransactionReceipt: () =>
          Promise.resolve({} as unknown as TransactionReceipt),
        removedEvent: () => ({}) as unknown as OrphanFilter,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthereumService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: TransactionTrackingService,
          useValue: {
            trackTransactionsForUser: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<EthereumService>(EthereumService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    jwtService = module.get<JwtService>(JwtService);
    transactionTrackingService = module.get<TransactionTrackingService>(
      TransactionTrackingService,
    );

    service['provider'] = {
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
    } as unknown as EthereumService['provider'];

    jest.spyOn(classValidator, 'validate').mockResolvedValue([]);
    toDtoMock = jest.fn();
    jest.spyOn(ethersLib, 'decodeRlp').mockImplementation((input: any) => {
      if (input === 'not-hex') {
        throw new Error('Invalid hex');
      }
      if (input === Buffer.from('single-value').toString('hex')) {
        throw new Error(
          'Invalid RLP data: expected an array of transaction hashes',
        );
      }
      if (
        input ===
        Buffer.from(['invalid1', 'invalid2'].join(',')).toString('hex')
      ) {
        throw new Error('Invalid transaction hash in RLP data');
      }
      if (input === Buffer.from(['0x123', '0x456'].join(',')).toString('hex')) {
        return ['0x123', '0x456'];
      }
      return [];
    });
  });

  describe('getTransactionsByHashes', () => {
    it('should return transactions from database if they exist', async () => {
      const findSpy = jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(mockTransactions);

      const hashes = ['0x123', '0x456'];
      const result = await service.getTransactionsByHashes(hashes);

      expect(findSpy).toHaveBeenCalledWith({
        where: { transactionHash: In(hashes) },
      });

      const provider = service['provider'];
      const getTransactionSpy = jest.spyOn(provider, 'getTransaction');
      const getReceiptSpy = jest.spyOn(provider, 'getTransactionReceipt');

      expect(getTransactionSpy).not.toHaveBeenCalled();
      expect(getReceiptSpy).not.toHaveBeenCalled();

      expect(result.length).toBe(2);
      expect(result[0].transactionHash).toBe('0x123');
      expect(result[1].transactionHash).toBe('0x456');
    });

    it('should fetch missing transactions from blockchain', async () => {
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue([mockTransactions[0]]);

      const provider = service['provider'];
      const getTransactionSpy = jest
        .spyOn(provider, 'getTransaction')
        .mockResolvedValue(mockTx as TransactionResponse);
      const getReceiptSpy = jest
        .spyOn(provider, 'getTransactionReceipt')
        .mockResolvedValue(mockReceipt as TransactionReceipt);

      jest.spyOn(service, 'saveTransaction').mockResolvedValue({
        transactionHash: '0x789',
        transactionStatus: 1,
        blockHash: '0xghi',
        blockNumber: 54321,
        from: '0xsender3',
        to: '0xreceiver3',
        contractAddress: null,
        logsCount: 2,
        input: '0xcalldata',
        value: '500000000000000000',
        users: [],
      });

      const hashes = ['0x123', '0x789'];
      const result = await service.getTransactionsByHashes(hashes);

      expect(getTransactionSpy).toHaveBeenCalledWith('0x789');
      expect(getReceiptSpy).toHaveBeenCalledWith('0x789');

      expect(result.length).toBe(2);
      expect(result[0].transactionHash).toBe('0x123');
      expect(result[1].transactionHash).toBe('0x789');
    });

    it('should track transactions for authenticated users', async () => {
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue([mockTransactions[0]]);
      const verifySpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: 1 });
      const trackSpy = jest.spyOn(
        transactionTrackingService,
        'trackTransactionsForUser',
      );

      await service.getTransactionsByHashes(['0x123'], 'valid-token');

      expect(verifySpy).toHaveBeenCalledWith('valid-token');
      expect(trackSpy).toHaveBeenCalledWith(1, [mockTransactions[0]]);
    });

    it('should handle invalid auth token gracefully', async () => {
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue([mockTransactions[0]]);
      const verifySpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));
      const trackSpy = jest.spyOn(
        transactionTrackingService,
        'trackTransactionsForUser',
      );

      const result = await service.getTransactionsByHashes(
        ['0x123'],
        'invalid-token',
      );

      expect(verifySpy).toHaveBeenCalledWith('invalid-token');
      expect(trackSpy).not.toHaveBeenCalled();
      expect(result.length).toBe(1);
    });

    it('should handle empty hash array', async () => {
      const result = await service.getTransactionsByHashes([]);
      expect(result).toEqual([]);
    });

    it('should handle invalid transaction hashes', async () => {
      jest.spyOn(transactionRepository, 'find').mockResolvedValue([]);
      jest
        .spyOn(service['provider'], 'getTransaction')
        .mockRejectedValue(new Error('Invalid hash'));
      jest
        .spyOn(service['provider'], 'getTransactionReceipt')
        .mockRejectedValue(new Error('Invalid hash'));

      const result = await service.getTransactionsByHashes(['0xinvalid']);
      expect(result).toEqual([]);
    });

    it('should handle partial blockchain failures', async () => {
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue([mockTransactions[0]]);
      jest
        .spyOn(service['provider'], 'getTransaction')
        .mockRejectedValue(new Error('Network error'));

      const result = await service.getTransactionsByHashes(['0x123', '0xfail']);
      expect(result).toHaveLength(1);
      expect(result[0].transactionHash).toBe('0x123');
    });

    it('should handle expired auth token gracefully', async () => {
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(mockTransactions);
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Token expired'));

      const result = await service.getTransactionsByHashes(
        ['0x123'],
        'expired-token',
      );
      expect(result).toHaveLength(1);
      expect(result[0].transactionHash).toBe('0x123');
    });

    describe('negative cases', () => {
      it('should handle errors during transaction saving', async () => {
        jest.spyOn(transactionRepository, 'find').mockResolvedValue([]);
        const provider = service['provider'];
        jest
          .spyOn(provider, 'getTransaction')
          .mockResolvedValue(mockTx as TransactionResponse);
        jest
          .spyOn(provider, 'getTransactionReceipt')
          .mockResolvedValue(mockReceipt as TransactionReceipt);
        jest
          .spyOn(service, 'saveTransaction')
          .mockRejectedValue(new Error('Save failed'));

        const result = await service.getTransactionsByHashes(['0x789']);

        expect(result).toEqual([]);
      });
    });
  });

  describe('saveTransaction', () => {
    it('should reject transactions without required fields', async () => {
      const invalidTx = { ...mockTx, hash: undefined };
      toDtoMock.mockReturnValue({
        transactionHash: '0x789',
        transactionStatus: 1,
        blockHash: '0xghi',
        blockNumber: 54321,
        from: '0xsender3',
        to: '0xreceiver3',
        contractAddress: null,
        logsCount: 2,
        input: '0xcalldata',
        value: '500000000000000000',
      });

      jest.spyOn(transactionRepository, 'save').mockImplementation(() => {
        throw new Error('Invalid transaction data');
      });

      jest.spyOn(classValidator, 'validate').mockResolvedValue([]);

      await expect(
        service.saveTransaction(
          invalidTx as unknown as TransactionResponse,
          mockReceipt as TransactionReceipt,
        ),
      ).rejects.toThrow('Failed to save transaction');
    });

    it('should handle validation errors', async () => {
      const validationError: ValidationError = {
        property: 'value',
        constraints: { isString: 'must be a string' },
        value: 'not-a-bigint',
        target: {},
        children: [],
      };
      jest
        .spyOn(classValidator, 'validate')
        .mockResolvedValue([validationError]);

      const invalidTx = {
        ...mockTx,
        value: 'not-a-bigint',
      };
      await expect(
        service.saveTransaction(
          invalidTx as unknown as TransactionResponse,
          mockReceipt as TransactionReceipt,
        ),
      ).rejects.toThrow('Transaction validation failed');
    });

    it('should handle database save errors', async () => {
      jest
        .spyOn(transactionRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.saveTransaction(
          mockTx as unknown as TransactionResponse,
          mockReceipt as TransactionReceipt,
        ),
      ).rejects.toThrow('Failed to save transaction');
    });
  });

  describe('getUserFromToken', () => {
    it('should return user ID for valid token', async () => {
      const verifySpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: 1 });

      const result = await service['getUserFromToken']('valid-token');

      expect(verifySpy).toHaveBeenCalledWith('valid-token');
      expect(result).toBe(1);
    });

    it('should return null for invalid token', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      const result = await service['getUserFromToken']('invalid-token');
      expect(result).toBeNull();
    });

    it('should return user ID for valid token with any user ID', async () => {
      const verifySpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: 999 });

      const result = await service['getUserFromToken']('valid-token');

      expect(verifySpy).toHaveBeenCalledWith('valid-token');
      expect(result).toBe(999);
    });

    it('should return null for database errors', async () => {
      const verifySpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Database error'));

      const result = await service['getUserFromToken']('valid-token');

      expect(verifySpy).toHaveBeenCalledWith('valid-token');
      expect(result).toBeNull();
    });
  });
});
