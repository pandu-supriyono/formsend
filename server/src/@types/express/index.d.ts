import 'express';
import { User } from '@/modules/user/entities/user.entity';
import { EntityDTO } from '@mikro-orm/core';

declare module 'express' {
  interface Request {
    user?: Omit<EntityDTO<User>, 'password'>;
  }
}
