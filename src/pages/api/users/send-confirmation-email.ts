import { NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import { prisma } from '@server/db';
import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { SendGridMailService } from '@lib/mail/SendGridMailService';

const sendMailConfirmation = async (
  req: EnsureAuthenticatedRequest,
  res: NextApiResponse
) => {
  const { userId } = req;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({ code: 'user-not-found' });
  }

  if (user.isUserActivated) {
    return res.status(400).json({ code: 'email-already-verified' });
  }

  const emailConfirmationToken = sign(
    { featCode: 'email-confirmation' },
    process.env.AUTH_SECRET,
    {
      expiresIn: '3h',
    }
  );

  const token = await prisma.verificationToken.create({
    data: {
      token: emailConfirmationToken,
      identifier: user.email,
      expires: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
    },
  });

  const url = `${process.env.NEXTAUTH_URL}/verify-email?token=${token.token}`;

  const mailService = new SendGridMailService();

  try {
    await mailService.send({
      to: user.email,
      template: 'emailConfirmation',
      templateData: {
        buttonLink: url,
      },
    });
  } catch (err) {
    return res.status(400).json({ code: 'mail.failed', message: err });
  }

  return res.status(200).json({ code: 'mail.sent' });
};

export default ensureAuthenticated(sendMailConfirmation);
