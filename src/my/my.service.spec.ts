import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MyService } from './my.service';
import { User } from '../users/entities/user.entity';
import { TransactionTrackingService } from '../transactions/transaction-tracking.service';
import { Transaction } from '../transactions/entities/transaction.entity';

describe('MyService', () => {
  let service: MyService;
  let userRepository: Repository<User>;
  let transactionTrackingService: TransactionTrackingService;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'password123',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TransactionTrackingService,
          useValue: {
            getUserTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    transactionTrackingService = module.get<TransactionTrackingService>(
      TransactionTrackingService,
    );
  });

  describe('getMyTransactions', () => {
    it('should return user transactions when user exists', async () => {
      const findOneSpy = jest.spyOn(userRepository, 'findOne');
      const getUserTransactionsSpy = jest.spyOn(
        transactionTrackingService,
        'getUserTransactions',
      );

      findOneSpy.mockResolvedValue(mockUser);
      getUserTransactionsSpy.mockResolvedValue(mockTransactions);

      const result = await service.getMyTransactions(mockUser.id);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(getUserTransactionsSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockTransactions);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const findOneSpy = jest.spyOn(userRepository, 'findOne');
      const getUserTransactionsSpy = jest.spyOn(
        transactionTrackingService,
        'getUserTransactions',
      );

      findOneSpy.mockResolvedValue(null);

      await expect(service.getMyTransactions(999)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(getUserTransactionsSpy).not.toHaveBeenCalled();
    });
  });
});
