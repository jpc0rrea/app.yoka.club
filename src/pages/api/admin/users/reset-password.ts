import { NextApiResponse } from 'next';
import { prisma } from '@server/db';
import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';
import authentication from '@models/authentication';
import eventLogs from '@models/event-logs';

interface AddCheckInsToUserRequest extends EnsureAuthenticatedRequest {
  query: {
    userId: string;
  };
}

const addCheckInsToUser = async (
  req: AddCheckInsToUserRequest,
  res: NextApiResponse
) => {
  const { userId } = req.query;
  console.log({ userId });
  const adminId = req.userId;

  if (!userId) {
    return res.status(400).json({
      message: 'erro ao adicionar check-ins',
      description: 'userId é obrigatório',
      errorCode: 'missing-parameters',
    });
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!admin) {
    return res.status(404).json({
      message: 'admin não foi encontrado',
      errorCode: 'admin-not-found',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: 'usuário não foi encontrado',
      errorCode: 'user-not-found',
    });
  }

  const { generatedPassword, hashedPassword } =
    await authentication.generateRandomPassword();

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  await eventLogs.createEventLog({
    userId,
    eventType: 'ADMIN.RESET_USER_PASSWORD',
    metadata: {
      adminId,
    },
    prismaInstance: prisma,
  });

  return res.status(201).json({
    message: 'senha resetada com sucesso',
    newPassword: generatedPassword,
  });
};

export default ensureAuthenticatedWithRole(addCheckInsToUser, ['ADMIN']);
