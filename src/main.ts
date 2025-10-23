import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { types } from 'pg';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IdentityConfig } from './identity/identity.config';

types.setTypeParser(1700, (val: string) => {
  return parseFloat(val);
});

//
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const identityConfig = app.get(IdentityConfig);
  await app.register(fastifyCookie, {
    secret: identityConfig.cookiesSecret,
  });

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:8081',
      'https://1f7142d3e88c.ngrok-free.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('Fabulous POS')
    .setDescription('This a just the API for the Fabulous POS')
    .addTag('Authentication')
    .addTag('Organization')
    .addTag('Catalog', 'Handle accounting groups, products and screens')
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
