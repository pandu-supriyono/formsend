import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  const logger = app.get<Logger>(Logger);

  app.useLogger(logger);

  await app.listen(configService.get('PORT'));
}
bootstrap();
