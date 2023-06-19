import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { verify } from 'jsonwebtoken';
import { TokenPayload } from '../users/verify-email';
import { BcryptHashAdapter } from '@lib/hash/BcryptHashAdapter';

interface ForgotPasswordRequest extends NextApiRequest {
  body: {
    password: string;
    token: string;
  };
}

const resetPassword = async (
  req: ForgotPasswordRequest,
  res: NextApiResponse
) => {
  const { password, token } = req.body;

  if (!password || !token || password.length < 6) {
    return res.status(400).json({
      message: 'não foi possível redefinir a senha',
      code: 'invalid-inputs',
    });
  }

  const { featCode } = verify(
    token,
    process.env.NEXTAUTH_SECRET
  ) as TokenPayload;

  if (featCode !== 'password-reset') {
    return res.status(400).json({
      code: 'invalid-token',
      message: 'token inválido',
      description: 'peça novamente a redefinição de senha',
    });
  }

  const resetPasswordToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!resetPasswordToken) {
    return res.status(400).json({
      code: 'invalid-token',
      message: 'token inválido',
      description: 'peça novamente a redefinição de senha',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: resetPasswordToken.identifier,
    },
  });

  if (!user) {
    return res.status(404).json({
      code: 'user-not-found',
      message: 'token inválido',
      description: 'peça novamente a redefinição de senha',
    });
  }

  const bcryptHashAdapter = new BcryptHashAdapter();

  const passwordHash = bcryptHashAdapter.hash(password, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: passwordHash,
    },
  });

  await prisma.verificationToken.delete({
    where: {
      token: resetPasswordToken.token,
    },
  });

  return res.status(200).json({
    message: 'senha redefinida com sucesso',
    description: 'você já pode fazer login com a nova senha',
    code: 'password-reset-success',
  });
};

export default resetPassword;
