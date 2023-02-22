import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { SignInDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() dto: SignInDto, @Req() req: Request) {
    const result = await this.authService.signIn(dto);

    if (!result.remember) {
      req.session.cookie.maxAge = null;
      req.session.cookie.expires = null;
    }

    req.session.user = result.user.id;

    return result.user;
  }
}
