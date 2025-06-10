import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class EthereumHealthIndicator extends HealthIndicator {
  private provider: ethers.JsonRpcProvider;

  constructor(private configService: ConfigService) {
    super();
    const nodeUrl = this.configService.get<string>('ETH_NODE_URL');
    if (!nodeUrl) {
      throw new Error('ETH_NODE_URL is not configured');
    }
    this.provider = new ethers.JsonRpcProvider(nodeUrl);
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const startTime = Date.now();
      const blockNumber = await this.provider.getBlockNumber();
      const responseTime = Date.now() - startTime;

      return this.getStatus(key, true, {
        blockNumber: blockNumber.toString(),
        responseTime: `${responseTime}ms`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return this.getStatus(key, false, { message: errorMessage });
    }
  }
}
