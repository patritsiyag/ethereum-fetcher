import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EthModule } from './eth/eth.module';
import { HealthModule } from './health/health.module';
import { AllModule } from './all/all.module';
import { AuthModule } from './auth/auth.module';
import { MyModule } from './my/my.module';
import { JwtModule } from '@nestjs/jwt';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_CONNECTION_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: true,
      migrationsTableName: 'migrations',
      synchronize: false,
      retryAttempts: 10,
      retryDelay: 3000,
      connectTimeoutMS: 10000,
    }),
    EthModule,
    HealthModule,
    AllModule,
    AuthModule,
    MyModule,
    TransactionsModule,
  ],
})
export class AppModule {}
