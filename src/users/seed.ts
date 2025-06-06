import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Seeds the database with initial user data.
 * Passwords are hashed using bcrypt before being stored.
 * @param dataSource - The TypeORM data source instance
 */
export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // Check if users already exist
  const existingUsers = await userRepository.find();
  if (existingUsers.length > 0) {
    return; // Don't seed if users already exist
  }

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

  await userRepository.save(users);
}
