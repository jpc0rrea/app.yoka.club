import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { verify } from 'jsonwebtoken';
import { NextApiResponse } from 'next';
import { prisma } from '@server/db';

interface VerifyEmailRequest extends EnsureAuthenticatedRequest {
  body: {
    token: string;
  };
}

export interface TokenPayload {
  featCode: string;
}

const verifyEmail = async (req: VerifyEmailRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ code: 'method-not-allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ code: 'invalid-token' });
  }

  const { featCode } = verify(token, process.env.AUTH_SECRET) as TokenPayload;

  if (featCode !== 'email-confirmation') {
    return res.status(400).json({ code: 'invalid-token' });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
  });

  if (!user) {
    return res.status(404).json({ code: 'user-not-found' });
  }

  // find the token in the db
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    return res.status(404).json({ code: 'token-not-found' });
  }

  // check if the token is expired
  if (verificationToken.expires < new Date()) {
    return res.status(400).json({ code: 'token-expired' });
  }

  // check if the token is valid
  if (verificationToken.identifier !== user.email) {
    return res.status(400).json({ code: 'token-invalid' });
  }

  // update the user
  await prisma.user.update({
    where: {
      id: req.userId,
    },
    data: {
      isUserActivated: true,
    },
  });

  // delete the token
  await prisma.verificationToken.delete({
    where: {
      token,
    },
  });

  return res.status(200).json({ code: 'email-verified' });
};

export default ensureAuthenticated(verifyEmail);
