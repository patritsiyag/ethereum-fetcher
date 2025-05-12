import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { Request, Response } from 'express';

type NextFunction = () => void;

interface HttpArgumentsHost {
  getRequest<T = any>(): T;
  getResponse<T = any>(): T;
  getNext<T = any>(): T;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({}) as unknown as Request,
      getResponse: () => ({}) as unknown as Response,
      getNext: () => (() => {}) as unknown as NextFunction,
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('canActivate', () => {
    it('should return true when token is valid', async () => {
      const mockRequest = {
        headers: {
          auth_token: 'valid.jwt.token',
        },
      } as unknown as Request;
      const mockPayload = { username: 'testuser', sub: 1 };

      const mockGetRequest = () => mockRequest;
      const mockGetResponse = () => ({}) as unknown as Response;
      const mockGetNext = () => (() => {}) as unknown as NextFunction;

      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: mockGetRequest as HttpArgumentsHost['getRequest'],
        getResponse: mockGetResponse as HttpArgumentsHost['getResponse'],
        getNext: mockGetNext as HttpArgumentsHost['getNext'],
      });
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(mockPayload);
      const verifyAsyncSpy = jest.spyOn(jwtService, 'verifyAsync');
      expect(verifyAsyncSpy).toHaveBeenCalledWith('valid.jwt.token');
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const mockRequest = {
        headers: {},
      } as unknown as Request;

      const mockGetRequest = () => mockRequest;
      const mockGetResponse = () => ({}) as unknown as Response;
      const mockGetNext = () => (() => {}) as unknown as NextFunction;

      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: mockGetRequest as HttpArgumentsHost['getRequest'],
        getResponse: mockGetResponse as HttpArgumentsHost['getResponse'],
        getNext: mockGetNext as HttpArgumentsHost['getNext'],
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      const verifyAsyncSpy = jest.spyOn(jwtService, 'verifyAsync');
      expect(verifyAsyncSpy).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const mockRequest = {
        headers: {
          auth_token: 'invalid.jwt.token',
        },
      } as unknown as Request;

      const mockGetRequest = () => mockRequest;
      const mockGetResponse = () => ({}) as unknown as Response;
      const mockGetNext = () => (() => {}) as unknown as NextFunction;

      jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
        getRequest: mockGetRequest as HttpArgumentsHost['getRequest'],
        getResponse: mockGetResponse as HttpArgumentsHost['getResponse'],
        getNext: mockGetNext as HttpArgumentsHost['getNext'],
      });
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
      const verifyAsyncSpy = jest.spyOn(jwtService, 'verifyAsync');
      expect(verifyAsyncSpy).toHaveBeenCalledWith('invalid.jwt.token');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from auth_token header', () => {
      const mockRequest = {
        headers: {
          auth_token: 'valid.jwt.token',
        },
      } as unknown as Request;

      const token = guard['extractTokenFromHeader'](mockRequest);

      expect(token).toBe('valid.jwt.token');
    });

    it('should return undefined when auth_token header is not present', () => {
      const mockRequest = {
        headers: {},
      } as unknown as Request;

      const token = guard['extractTokenFromHeader'](mockRequest);

      expect(token).toBeUndefined();
    });
  });
});
