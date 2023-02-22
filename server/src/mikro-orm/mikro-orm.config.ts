import { defineConfig } from '@mikro-orm/postgresql';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  clientUrl: process.env.POSTGRES_URL,
  type: 'postgresql',
  seeder: {
    path: './src/mikro-orm/seeders',
    emit: 'ts',
  },
  migrations: {
    path: './src/mikro-orm/migrations',
    emit: 'ts',
  },
});
