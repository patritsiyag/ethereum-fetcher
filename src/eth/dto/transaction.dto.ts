import { IsString, IsNumber, IsOptional } from 'class-validator';

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

  @IsString()
  @IsOptional()
  contractAddress: string | null;

  @IsNumber()
  logsCount: number;

  @IsString()
  input: string;

  @IsString()
  value: string;
}
