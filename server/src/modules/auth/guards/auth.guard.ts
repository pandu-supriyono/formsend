import { UserRole } from '@/modules/user/entities/user.entity';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class AuthGuard implements CanActivate {
  roles: UserRole[];

  constructor(...roles: UserRole[]) {
    this.roles = roles || [];
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as Request;

    if (req.user == null) {
      return false;
    }

    const roles = this.roles || [];

    if (roles.length < 1) {
      return true;
    }

    return roles.includes(req.user.role);
  }
}
