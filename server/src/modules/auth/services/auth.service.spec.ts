import { User } from '@/modules/user/entities/user.entity';
import { UserService } from '@/modules/user/services/user.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { mock, mockClear } from 'jest-mock-extended';
import { SignInDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  const userService = mock<UserService>();
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(userService);
  });

  afterEach(() => {
    mockClear(userService);
    jest.resetAllMocks();
  });

  describe('signIn', () => {
    it('throws a NotFoundException when a user is not returned', async () => {
      const dto = mock<SignInDto>();
      userService.findByEmail.mockResolvedValueOnce(null);

      await expect(authService.signIn(dto)).rejects.toThrow(NotFoundException);
    });

    it('throws an UnauthorizedException when the password is invalid', async () => {
      const correctPassword = '123';
      const user = mock<User>();
      user.password = await bcrypt.hash(correctPassword, 10);

      userService.findByEmail.mockResolvedValueOnce(user);

      const dto = mock<SignInDto>();

      dto.password = 'incorrectPassword';

      await expect(authService.signIn(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns the user when the password is valid', async () => {
      const correctPassword = '123';
      const user = mock<User>();
      user.password = await bcrypt.hash(correctPassword, 10);

      userService.findByEmail.mockResolvedValueOnce(user);

      const dto = mock<SignInDto>();

      dto.password = correctPassword;

      const result = await authService.signIn(dto);

      expect(result).toMatchObject({
        user,
        remember: dto.remember,
      });
    });
  });
});
