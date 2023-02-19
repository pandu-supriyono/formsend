import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
