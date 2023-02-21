import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import * as bcrypt from 'bcryptjs';
import { User } from '@/modules/user/entities/user.entity';

export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (email == null && password == null) {
      console.log(
        `AdminSeeder - Admin email and/or password is not set using environment variables ADMIN_EMAIL and ADMIN_PASSWORD`,
      );

      console.log('AdminSeeder - Skipping');

      return;
    }

    console.log(`AdminSeeder - Seeding admin ${email}`);

    const user = em.create(User, {
      email,
      password: bcrypt.hashSync(password),
    });

    em.persistAndFlush(user);

    console.log(`AdminSeeder - Successfully seeded admin ${email}`);
  }
}
