import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
const users = [
  {
    username: 'alice',
    password: 'alice',
  },
  {
    username: 'bob',
    password: 'bob',
  },
  {
    username: 'carol',
    password: 'carol',
  },
  {
    username: 'dave',
    password: 'dave',
  },
];

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  for (const user of users) {
    const existingUser = await userRepository.findOne({
      where: { username: user.username },
    });

    if (!existingUser) {
      const newUser = userRepository.create(user);
      await userRepository.save(newUser);
      console.log(`Created user: ${user.username}`);
    }
  }
}
