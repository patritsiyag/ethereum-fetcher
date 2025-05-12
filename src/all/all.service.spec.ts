import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllService } from './all.service';
import { Transaction } from '../transactions/entities/transaction.entity';

jest.mock('../transactions/transactions.dto', () => ({
  fromEntity: jest.fn((entity: Transaction) => ({
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
  })),
}));

describe('AllService', () => {
  let service: AllService;
  let transactionRepository: Repository<Transaction>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AllService>(AllService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  describe('getAllTransactions', () => {
    it('should return all transactions from the database', async () => {
      const findSpy = jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(mockTransactions);

      const result = await service.getAllTransactions();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(mockTransactions);
      expect(result.length).toBe(2);
      expect(result[0].transactionHash).toBe('0x123');
      expect(result[1].transactionHash).toBe('0x456');
    });

    it('should return empty array when no transactions exist', async () => {
      const findSpy = jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue([]);

      const result = await service.getAllTransactions();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(transactionRepository, 'find')
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(service.getAllTransactions()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
