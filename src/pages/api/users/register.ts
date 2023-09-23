import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { BcryptHashAdapter } from '@lib/hash/BcryptHashAdapter';
import { isValidPhoneNumber } from 'react-phone-number-input';

interface RegisterRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
  };
}

const register = async (req: RegisterRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }

  const { email, password, name, phoneNumber } = req.body;

  console.log(req.body);

  if (
    !email ||
    !email.includes('@') ||
    !password ||
    password.trim().length < 6 ||
    !name ||
    name.trim().length < 6 ||
    !phoneNumber
  ) {
    return res.status(422).json({
      code: 'invalid-input',
    });
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return res.status(422).json({
      code: 'invalid-phone-number',
    });
  }

  const userWithSameEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userWithSameEmail) {
    return res.status(422).json({
      code: 'user-already-exists',
    });
  }

  const bcryptHashAdapter = new BcryptHashAdapter();

  const passwordHash = bcryptHashAdapter.hash(password, 10);

  let username = email.split('@')[0] || email;

  const userWithSameUsername = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (userWithSameUsername) {
    username = `${username}-${Math.random().toString(36).substr(2, 9)}`;
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name: name,
      // get only the first name
      displayName: name.split(' ')[0] || name,
      username,
      phoneNumber,
    },
  });

  return res.status(201).json({
    code: 'user-created',
    user,
  });
};

export default register;
