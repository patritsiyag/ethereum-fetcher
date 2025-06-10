import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as figlet from 'figlet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

const appName = 'Eth fetcher API';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      maxParamLength: 10000,
    }),
    {
      rawBody: true,
    },
  );
  app.setGlobalPrefix('lime');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription('Documentation of API endpoints')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/document', app, document);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap()
  .then(() => {
    return new Promise<void>((resolve) => {
      figlet('Eth fetcher', (err) => {
        if (err) {
          resolve();
          return;
        }
        resolve();
      });
    });
  })
  .catch((error) => {
    console.error('Error starting application:', error);
    process.exit(1);
  });
