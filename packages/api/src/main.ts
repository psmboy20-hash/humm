import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // CORS 설정
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // 전역 Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Virtual Closet API is running on: http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
}

bootstrap();
