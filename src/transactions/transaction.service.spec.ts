import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TransactionService } from './transaction.service';
import { User } from '../users/entities/user.entity';
import { Transaction } from './entities/transaction.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let userRepository: Repository<User>;
  let transactionRepository: Repository<Transaction>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'password',
    transactions: [],
  };

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

  const mockExistingTransactions: Transaction[] = [
    {
      transactionHash: '0x789',
      transactionStatus: 1,
      blockHash: '0xghi',
      blockNumber: 54321,
      from: '0xsender3',
      to: '0xreceiver3',
      contractAddress: null,
      logsCount: 1,
      input: '0xexisting',
      value: '500000000000000000',
      users: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            createQueryBuilder: jest.fn(() => {
              const mockQueryBuilder: Partial<SelectQueryBuilder<Transaction>> =
                {
                  innerJoin: jest.fn().mockReturnThis(),
                  getMany: jest
                    .fn()
                    .mockResolvedValue(mockExistingTransactions),
                };
              return mockQueryBuilder as unknown as SelectQueryBuilder<Transaction>;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  describe('trackTransactionsForUser', () => {
    it('should track new transactions for an existing user', async () => {
      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue({ ...mockUser });

      const queryBuilderSpy = jest.spyOn(
        transactionRepository,
        'createQueryBuilder',
      );

      const saveSpy = jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUser,
        transactions: [...mockTransactions, ...mockExistingTransactions],
      });

      await service.trackTransactionsForUser(1, mockTransactions);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['transactions'],
      });
      expect(queryBuilderSpy).toHaveBeenCalledWith('transaction');
      expect(saveSpy).toHaveBeenCalledWith({
        ...mockUser,
        transactions: [...mockExistingTransactions, ...mockTransactions],
      });
    });

    it('should do nothing if user does not exist', async () => {
      const findOneSpy = jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(null);

      const saveSpy = jest.spyOn(userRepository, 'save');

      await service.trackTransactionsForUser(999, mockTransactions);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['transactions'],
      });
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.trackTransactionsForUser(1, mockTransactions),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getUserTransactions', () => {
    it('should return user transactions when user exists', async () => {
      const userWithTransactions = {
        ...mockUser,
        transactions: mockTransactions,
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(userWithTransactions);

      const result = await service.getUserTransactions(1);

      expect(result).toEqual(mockTransactions);
    });

    it('should return empty array when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getUserTransactions(999);

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getUserTransactions(1)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
