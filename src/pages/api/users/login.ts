import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { BcryptHashAdapter } from '@lib/hash/BcryptHashAdapter';

interface LoginRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

const login = async (req: LoginRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }

  console.log(req.body);

  const { email, password } = req.body;

  if (
    !email ||
    !email.includes('@') ||
    !password ||
    password.trim().length < 6
  ) {
    return res.status(422).json({
      code: 'invalid-input',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(422).json({
      code: 'invalid-credentials',
    });
  }

  if (!user.password) {
    return res.status(422).json({
      code: 'invalid-login-method',
    });
  }

  const bcryptHashAdapter = new BcryptHashAdapter();

  const passwordMatch = bcryptHashAdapter.compareHash(password, user.password);

  if (!passwordMatch) {
    return res.status(422).json({
      code: 'invalid-credentials',
    });
  }

  return res.status(200).json({
    code: 'login-success',
    user,
  });
};

export default login;
