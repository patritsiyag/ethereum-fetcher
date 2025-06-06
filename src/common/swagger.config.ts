import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Ethereum Transaction Fetcher API')
  .setDescription('API for fetching and managing Ethereum transactions')
  .setVersion('1.0')
  .addTag('ethereum', 'Ethereum transaction operations')
  .addTag('auth', 'Authentication operations')
  .addTag('transactions', 'Transaction management operations')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

export const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};
