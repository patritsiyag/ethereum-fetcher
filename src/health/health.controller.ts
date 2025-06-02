import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { EthereumHealthIndicator } from './indicators/ethereum.health';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator,
    private eth: EthereumHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    try {
      this.logger.log('Starting health check...');
      const result = await this.health.check([
        async (): Promise<HealthIndicatorResult> => {
          this.logger.log('Checking database health...');
          return this.db.isHealthy('database');
        },
        async (): Promise<HealthIndicatorResult> => {
          this.logger.log('Checking ethereum node health...');
          return this.eth.isHealthy('ethereum');
        },
      ]);
      this.logger.log('Health check completed successfully');
      return result;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw error;
    }
  }
}
