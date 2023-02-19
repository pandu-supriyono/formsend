import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { EnvironmentVariables, validateConfig, Environment } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        pinoHttp: {
          level:
            configService.get('NODE_ENV') === Environment.Production
              ? 'info'
              : 'debug',
          transport:
            configService.get('NODE_ENV') !== Environment.Production
              ? { target: 'pino-pretty' }
              : undefined,
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
