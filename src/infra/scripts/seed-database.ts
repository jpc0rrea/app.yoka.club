import { CreateUserData } from '@models/user/types';
import { PrismaClient, UserRole } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

seedDatabase();

async function seedDatabase() {
  console.log('> Seeding database...');

  await seedDevelopmentUsers();
  await addInitialCheckInToUsers();

  console.log('\n> Database seeded!');
}

async function seedDevelopmentUsers() {
  await insertUser({
    email: 'user@user.com',
    name: 'usuário normal',
    password: 'password',
    phoneNumber: '+5522999999999',
    role: 'USER',
  });

  await insertUser({
    email: 'admin@admin.com',
    name: 'administrador do sistema',
    password: 'password',
    phoneNumber: '+5522999999999',
    role: 'ADMIN',
  });

  console.log('------------------------------');
  console.log(
    '> you can now login to yogacomkaka using the following credentials:'
  );
  console.log('> "admin@admin.com" + "password"');
  console.log('> "user@user.com" + "password"');
  console.log('------------------------------');
}

async function addInitialCheckInToUsers() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const createStatementPromise = prisma.statement.create({
      data: {
        userId: user.id,
        checkInsQuantity: 1,
        title: 'check-in inicial',
        description: 'check-in inicial',
        type: 'CREDIT',
      },
    });

    const updateUserPromise = prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        checkInsQuantity: 1,
      },
    });

    await prisma.$transaction([createStatementPromise, updateUserPromise]);
  }
}

interface InsertUserData extends CreateUserData {
  role: UserRole;
}

async function insertUser({
  email,
  name,
  password,
  phoneNumber,
  role,
}: InsertUserData) {
  const username = email.split('@')[0] || email;

  const displayName = name;

  const passwordHash = await bcryptjs.hash(password, 1);

  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name,
      phoneNumber,
      username,
      displayName,
      isUserActivated: true,
      role,
    },
  });
}
