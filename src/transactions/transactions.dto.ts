import {
  IsString,
  IsNumber,
  IsOptional,
  IsEthereumAddress,
} from 'class-validator';
import { Transaction } from './entities/transaction.entity';
import { plainToInstance } from 'class-transformer';
import { ethers } from 'ethers';

export class TransactionDto {
  @IsString()
  transactionHash: string;

  @IsNumber()
  transactionStatus: number;

  @IsString()
  blockHash: string;

  @IsNumber()
  blockNumber: number;

  @IsString()
  from: string;

  @IsString()
  @IsOptional()
  to: string | null;

  @IsEthereumAddress()
  @IsOptional()
  contractAddress: string | null;

  @IsNumber()
  logsCount: number;

  @IsString()
  input: string;

  @IsString()
  value: string;
}

export function toDto(
  transaction: ethers.TransactionResponse,
  transactionReceipt: ethers.TransactionReceipt,
): TransactionDto {
  const dto = new TransactionDto();
  dto.transactionHash = transaction.hash;
  dto.transactionStatus = transactionReceipt.status ?? 0;
  dto.blockHash = transaction.blockHash ?? '';
  dto.blockNumber = transaction.blockNumber ?? 0;
  dto.from = transaction.from;
  dto.to = transaction.to;
  dto.contractAddress = transactionReceipt.contractAddress;
  dto.logsCount = transactionReceipt.logs.length;
  dto.input = transaction.data;
  dto.value = transaction.value.toString();
  return dto;
}

export function toEntity(dto: TransactionDto): Transaction {
  const entity = new Transaction();
  entity.transactionHash = dto.transactionHash;
  entity.transactionStatus = dto.transactionStatus;
  entity.blockHash = dto.blockHash;
  entity.blockNumber = dto.blockNumber;
  entity.from = dto.from;
  entity.to = dto.to;
  entity.contractAddress = dto.contractAddress;
  entity.logsCount = dto.logsCount;
  entity.input = dto.input;
  entity.value = dto.value;
  return entity;
}

export function fromEntity(entity: Transaction): TransactionDto {
  return plainToInstance(TransactionDto, entity);
}
