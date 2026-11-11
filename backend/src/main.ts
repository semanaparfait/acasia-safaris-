import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { allowedOrigins } from './common/origins';
import { LiveAdapter } from './live/live.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Online, the API usually sits behind a proxy (Render, Railway, Nginx…): set TRUST_PROXY=1
  // so request limits count each visitor's real IP, not the proxy's. Leave it unset locally,
  // otherwise anyone could fake their IP with an X-Forwarded-For header.
  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy) app.set('trust proxy', Number(trustProxy) || trustProxy);

  // Every route starts with /api, e.g. GET http://localhost:4000/api/packages
  app.setGlobalPrefix('api');

  // Security headers (no sniffing, no framing, HSTS on https…). Images and PDFs are
  // shown by the website on another address, so they may be loaded cross-origin.
  // No Content-Security-Policy here: this API only returns JSON and files (Swagger needs inline scripts).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Reads the login cookie (see auth/session.ts)
  app.use(cookieParser());

  // Websites allowed to call this API (see common/origins.ts)
  app.enableCors({ origin: allowedOrigins(), credentials: true });

  // Live updates (Socket.IO at /socket.io, namespace /live), same allowed websites
  app.useWebSocketAdapter(new LiveAdapter(app));

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
  console.log(`CORS allows:  ${allowedOrigins().join(', ')}`);
}
bootstrap();
