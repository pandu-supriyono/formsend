import { UserService } from '@/modules/user/services/user.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class UserSessionMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
      const user = await this.userService.findById(req.session.user);

      req.user = user.toJSON();
    }

    next();
  }
}
