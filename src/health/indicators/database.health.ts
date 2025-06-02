import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private dataSource: DataSource) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.dataSource.isInitialized) {
        return this.getStatus(key, false, {
          message: 'Database not initialized',
        });
      }

      const startTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const queryTime = Date.now() - startTime;

      return this.getStatus(key, true, {
        queryTime: `${queryTime}ms`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return this.getStatus(key, false, { message: errorMessage });
    }
  }
}
