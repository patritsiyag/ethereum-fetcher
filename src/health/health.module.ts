import { Module } from '@nestjs/common';
import { TerminusModule, MemoryHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 8800,
    }),
  ],
  controllers: [HealthController],
  providers: [MemoryHealthIndicator],
})
export class HealthModule {}
