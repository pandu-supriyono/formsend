import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { EnvironmentVariables, validateConfig, Environment } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
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
    UserModule,
    AuthModule,
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', '..', 'client', 'dist'),
        renderPath: 'app.js',
        exclude: ['api/*'],
      },
      {
        rootPath: join(__dirname, '..', '..', 'client', 'public'),
        exclude: ['api/*'],
      },
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
