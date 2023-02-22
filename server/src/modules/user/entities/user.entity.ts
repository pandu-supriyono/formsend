import {
  BaseEntity,
  Entity,
  Enum,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

export enum UserRole {
  ADMIN = 'ADMIN',
  REGULAR = 'REGULAR',
}

interface IUser {
  id: number;
  role: UserRole;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

@Entity()
export class User extends BaseEntity<IUser, 'id'> implements IUser {
  @PrimaryKey()
  id: number;

  @Property({
    unique: true,
  })
  email: string;

  @Property({
    hidden: true,
  })
  password: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.REGULAR;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
