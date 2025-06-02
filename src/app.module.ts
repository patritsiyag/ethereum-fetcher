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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DB_CONNECTION_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: false,
      }),
      inject: [ConfigService],
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
