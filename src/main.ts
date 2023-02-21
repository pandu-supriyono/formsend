import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config';
import * as session from 'express-session';
import * as pgSessionStore from 'connect-pg-simple';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const PGSessionStore = pgSessionStore(session);

  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  const logger = app.get<Logger>(Logger);

  app.useLogger(logger);

  app.use(
    session({
      store: new PGSessionStore({
        createTableIfMissing: true,
        conString: configService.get('POSTGRES_URL'),
        errorLog: logger.error,
      }),
      secret: configService.get('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      name: configService.get('COOKIE_NAME'),
      cookie: {
        maxAge: configService.get('COOKIE_MAX_AGE'),
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.setGlobalPrefix('/api');

  await app.listen(configService.get('PORT'));
}
bootstrap();
