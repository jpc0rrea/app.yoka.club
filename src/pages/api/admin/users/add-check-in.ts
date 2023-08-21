import { NextApiResponse } from 'next';
import { prisma } from '@server/db';
import {
  EnsureAuthenticatedRequest,
  ensureAuthenticatedWithRole,
} from '@server/middlewares/ensureAuthenticated';

interface AddCheckInsToUserRequest extends EnsureAuthenticatedRequest {
  body: {
    userId: string;
    checkInsQuantity: number;
  };
}

const addCheckInsToUser = async (
  req: AddCheckInsToUserRequest,
  res: NextApiResponse
) => {
  const { userId, checkInsQuantity } = req.body;
  const adminId = req.userId;

  if (!userId || !checkInsQuantity) {
    return res.status(400).json({
      message: 'erro ao adicionar check-ins',
      description: 'userId e checkInsQuantity são obrigatórios',
      errorCode: 'missing-parameters',
    });
  }

  if (checkInsQuantity < 0) {
    return res.status(400).json({
      message: 'erro ao adicionar check-ins',
      description: 'checkInsQuantity não pode ser menor que zero',
      errorCode: 'invalid-check-ins-quantity',
    });
  }

  if (checkInsQuantity > 100) {
    return res.status(400).json({
      message: 'erro ao adicionar check-ins',
      description: 'checkInsQuantity não pode ser maior que 100',
      errorCode: 'invalid-check-ins-quantity',
    });
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: adminId,
    },
  });

  if (!admin) {
    return res.status(404).json({
      message: 'usuário não foi encontrado',
      errorCode: 'user-not-found',
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

  const updateUser = prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      checkInsQuantity: {
        increment: checkInsQuantity,
      },
    },
  });

  const createStatement = prisma.statement.create({
    data: {
      userId: user.id,
      title: `check-ins adicionados por ${admin.name}}`,
      description: `${checkInsQuantity} check-ins adicionados por ${admin.name}`,
      type: 'CREDIT',
      checkInsQuantity,
    },
  });

  await prisma.$transaction([updateUser, createStatement]);

  return res.status(201).json({
    message: 'check-ins adicionados com sucesso',
    checkInsQuantity: user.checkInsQuantity + checkInsQuantity,
  });
};

export default ensureAuthenticatedWithRole(addCheckInsToUser, ['ADMIN']);
