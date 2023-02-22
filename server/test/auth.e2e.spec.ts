import { AuthModule } from '@/modules/auth/auth.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as session from 'express-session';
import * as pgSessionStore from 'connect-pg-simple';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables, validateConfig } from '@/config';
import mikroOrmConfig from '@/mikro-orm/mikro-orm.config';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '@/modules/user/entities/user.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let user: User;
  let em: EntityManager;
  let configService: ConfigService<EnvironmentVariables, true>;
  let module: TestingModule;
  let store: pgSessionStore.PGStore;
  const fakeUserRaw = {
    email: faker.internet.email(),
    password: faker.datatype.uuid(),
  };

  const hashedPassword = bcrypt.hashSync(fakeUserRaw.password);

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot(mikroOrmConfig),
        AuthModule,
        ConfigModule.forRoot({
          validate: validateConfig,
        }),
      ],
    }).compile();

    app = module.createNestApplication();

    em = app.get<EntityManager>(EntityManager);

    const emInstance = em.fork();

    user = emInstance.create(User, {
      email: fakeUserRaw.email.toLowerCase(),
      password: hashedPassword,
    });

    emInstance.persistAndFlush(user);

    configService =
      app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

    const PGSessionStore = pgSessionStore(session);

    store = new PGSessionStore({
      createTableIfMissing: true,
      conString: configService.get('POSTGRES_URL'),
    });

    app.use(
      session({
        store,
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

    await app.init();
  });

  afterAll(async () => {
    const emInstance = em.fork();
    await emInstance.removeAndFlush(user);
    emInstance.clear();
    await app.close();
    await module.close();
    store.close();
  });

  describe('/api/auth/sign-in', () => {
    it('returns 400 when no credentials are entered', () => {
      return request(app.getHttpServer()).post('/api/auth/sign-in').expect(400);
    });

    it('returns 404 when an unknown user is entered', () => {
      return request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({
          email: 'invalid@email.com',
          password: 'invalidpassword',
        })
        .expect(404);
    });

    it('returns 401 if invalid credentials are entered', () => {
      return request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({
          email: fakeUserRaw.email,
          password: 'invalidpassword',
        })
        .expect(401);
    });

    it('returns the logged in user when correct credentials are entered', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send(fakeUserRaw);

      expect(result.body).toMatchObject({
        email: fakeUserRaw.email.toLowerCase(),
      });
    });

    it('is case insensitive for email addresses', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({
          ...fakeUserRaw,
          email: fakeUserRaw.email.toUpperCase(),
        });

      expect(result.body).toMatchObject({
        email: fakeUserRaw.email.toLowerCase(),
      });
    });

    it('sets cookies when signed in', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send(fakeUserRaw);

      expect(result.headers['set-cookie'][0]).toEqual(
        expect.stringContaining(configService.get('COOKIE_NAME')),
      );
    });

    it('sets persistent cookies when remember is set to true', async () => {
      const result = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({
          ...fakeUserRaw,
          remember: true,
        });

      expect(result.headers['set-cookie'][0]).toEqual(
        expect.stringContaining('Expires='),
      );
    });
  });
});
