import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() req: Request) {
    return req.user as Omit<User, 'password'>;
  }
}
