import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.setGlobalPrefix('blackrock/challenge/v1')
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  console.log(`Server is running on port ${process.env.PORT ?? 5477}`);
  await app.listen(process.env.PORT ?? 5477, '0.0.0.0');
}
bootstrap();
