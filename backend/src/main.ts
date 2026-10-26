import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Every route starts with /api, e.g. GET http://localhost:4000/api/packages
  app.setGlobalPrefix('api');

  // Websites allowed to call this API from the browser.
  // FRONTEND_URL can hold several, separated by commas:
  //   FRONTEND_URL="http://localhost:3000,https://acacia-safaris.vercel.app"
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, '')); // ignore a trailing "/"
  app.enableCors({ origin: allowedOrigins });

  // Check request bodies against the DTO classes (dto/*.ts).
  // whitelist: unknown fields are removed. transform: "5" becomes 5 where a number is expected.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger: interactive API docs at /api/docs (the raw spec is at /api/docs-json).
  // Click "Authorize" and paste the token from POST /api/auth/login to try admin routes.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Acacia Safaris API')
    .setDescription(
      'Backend for the Acacia Safaris website and admin panel. ' +
        'Routes with a lock need an admin login: call POST /api/auth/login, ' +
        'then click "Authorize" and paste the token.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true }, // keep the token after a page reload
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
  console.log(`API docs on   http://localhost:${port}/api/docs`);
}
bootstrap();
