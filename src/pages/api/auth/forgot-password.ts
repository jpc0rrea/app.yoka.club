import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { sign } from 'jsonwebtoken';
import { SendGridMailService } from '@lib/mail/SendGridMailService';
import webserver from '@infra/webserver';

interface ForgotPasswordRequest extends NextApiRequest {
  body: {
    email: string;
  };
}

const forgotPassword = async (
  req: ForgotPasswordRequest,
  res: NextApiResponse
) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'e-mail obrigatório',
      code: 'email-required',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(404).json({
      code: 'user-not-found',
      message: 'usuário não encontrado',
      description: 'não existe nenhum usuário com esse e-mail',
    });
  }

  if (!user.password) {
    return res.status(400).json({
      code: 'auth-no-password',
      message: 'usuário não possui senha',
      description: 'este usuário foi cadastrado usando uma rede social',
    });
  }

  const passwordResetToken = sign(
    { featCode: 'password-reset' },
    process.env.AUTH_SECRET,
    {
      expiresIn: '3h',
    }
  );

  const token = await prisma.verificationToken.create({
    data: {
      token: passwordResetToken,
      identifier: user.email,
      expires: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
    },
  });

  const url = `${webserver.host}/reset-password?token=${token.token}`;

  const mailService = new SendGridMailService();

  try {
    await mailService.send({
      to: user.email,
      template: 'forgotPassword',
      templateData: {
        buttonLink: url,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      code: 'mail.failed',
      message: 'erro ao enviar e-mail',
      description: 'tente novamente mais tarde',
    });
  }

  return res.status(200).json({
    code: 'mail.sent',
    message: 'e-mail enviado com sucesso',
    description: 'verifique sua caixa de entrada',
  });
};

export default forgotPassword;
