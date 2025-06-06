import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedInitialUsers1709123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const saltRounds = 10;
    const users = [
      {
        username: 'alice',
        password: await bcrypt.hash('alice', saltRounds),
      },
      {
        username: 'bob',
        password: await bcrypt.hash('bob', saltRounds),
      },
      {
        username: 'carol',
        password: await bcrypt.hash('carol', saltRounds),
      },
      {
        username: 'dave',
        password: await bcrypt.hash('dave', saltRounds),
      },
    ];

    for (const user of users) {
      const result = (await queryRunner.query(
        `SELECT username FROM "user" WHERE username = $1`,
        [user.username],
      )) as { username: string }[];

      if (!result || result.length === 0) {
        await queryRunner.query(
          `INSERT INTO "user" (username, password) VALUES ($1, $2)`,
          [user.username, user.password],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "user" WHERE username IN ($1, $2, $3, $4)`,
      ['alice', 'bob', 'carol', 'dave'],
    );
  }
}
