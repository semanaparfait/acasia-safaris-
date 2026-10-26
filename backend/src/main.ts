import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Every route starts with /api, e.g. GET http://localhost:4000/api/packages
  app.setGlobalPrefix('api');

  // Let the Next.js website call this API from the browser
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  // Check request bodies against the DTO classes (dto/*.ts).
  // whitelist: unknown fields are removed. transform: "5" becomes 5 where a number is expected.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();
