import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'password123',
    transactions: [],
  };

  const mockUsername = 'testuser';
  const mockPassword = 'password123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return a JWT token when credentials are valid', async () => {
      const mockToken = 'valid.jwt.token';
      const findOneSpy = jest.spyOn(usersRepository, 'findOne');
      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      findOneSpy.mockResolvedValue(mockUser);
      signAsyncSpy.mockResolvedValue(mockToken);

      const result = await service.validateUser(mockUsername, mockPassword);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(signAsyncSpy).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
      });
      expect(result).toBe(mockToken);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const findOneSpy = jest.spyOn(usersRepository, 'findOne');
      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      findOneSpy.mockResolvedValue(null);

      await expect(
        service.validateUser(mockUsername, mockPassword),
      ).rejects.toThrow(UnauthorizedException);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(signAsyncSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const wrongPassword = 'wrongpassword';
      const findOneSpy = jest.spyOn(usersRepository, 'findOne');
      const signAsyncSpy = jest.spyOn(jwtService, 'signAsync');

      findOneSpy.mockResolvedValue(mockUser);

      await expect(
        service.validateUser(mockUsername, wrongPassword),
      ).rejects.toThrow(UnauthorizedException);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { username: mockUsername },
      });
      expect(signAsyncSpy).not.toHaveBeenCalled();
    });
  });
});
