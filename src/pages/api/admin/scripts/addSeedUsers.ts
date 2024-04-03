import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';

const addSeedUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  // create 100 random users
  for (let i = 0; i < 100; i++) {
    await prisma.user.create({
      data: {
        email: `
          ${Math.random().toString(36).substring(7)}@${Math.random()
          .toString(36)
          .substring(7)}.com`,
        name: 'user',
        password: '123',
        displayName: 'user',
        username: `user-seed-${i}`,
        phoneNumber: '123',
        // createdAt is a random date in this month
        createdAt: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          Math.floor(Math.random() * 30) + 1
        ),
      },
    });
  }

  return res.status(200).json({ message: 'Done' });
};

export default addSeedUsers;
