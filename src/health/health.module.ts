import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { EthereumHealthIndicator } from './indicators/ethereum.health';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TerminusModule, TypeOrmModule.forFeature([]), ConfigModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, EthereumHealthIndicator],
})
export class HealthModule {}
