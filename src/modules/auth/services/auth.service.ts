import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from '@/modules/user/services/user.service';
import { SignInDto } from '../dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signIn(dto: SignInDto) {
    const { email, password, remember } = dto;

    const user = await this.userService.findByEmail(email);

    if (user == null) {
      throw new NotFoundException();
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException();
    }

    return {
      user,
      remember,
    };
  }
}
