import { User } from '@/modules/user/entities/user.entity';
import { UserService } from '@/modules/user/services/user.service';
import { MikroORM } from '@mikro-orm/postgresql';
import { NextFunction, Request, Response } from 'express';
import { mock, mockClear } from 'jest-mock-extended';
import { UserSessionMiddleware } from './user-session.middleware';

jest.mock('@mikro-orm/core', () => {
  return {
    ...jest.requireActual('@mikro-orm/core'),
    UseRequestContext: () => jest.fn(),
  };
});

describe('UserSessionMiddleware', () => {
  const userService = mock<UserService>();
  const orm = mock<MikroORM>();
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let userSessionMiddleware: UserSessionMiddleware;

  beforeEach(() => {
    userSessionMiddleware = new UserSessionMiddleware(userService, orm);

    req = {
      session: {},
    } as Request;
    res = {} as Response;
    next = jest.fn();
  });

  afterEach(() => {
    mockClear(userService);
    mockClear(orm);
    jest.resetAllMocks();
  });

  it('does not set req.user when no user ID is in session', async () => {
    await userSessionMiddleware.use(req, res, next);

    expect(req.user).toBeFalsy();
  });

  it('finds a user when there is a user ID in session', async () => {
    const mockedUser = mock<User>();
    userService.findById.mockResolvedValueOnce(mockedUser);

    const userId = 123;
    req.session.user = userId;

    await userSessionMiddleware.use(req, res, next);

    expect(userService.findById).toHaveBeenCalledWith(userId);
  });

  it('sets a user in req.user if there is a user ID in session', async () => {
    const mockedUser = mock<User>();
    mockedUser.toJSON.mockReturnThis();
    userService.findById.mockResolvedValueOnce(mockedUser);

    const userId = 123;
    req.session.user = userId;

    await userSessionMiddleware.use(req, res, next);

    expect(req.user).toEqual(mockedUser);
  });

  it('calls nextFunction', async () => {
    await userSessionMiddleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
