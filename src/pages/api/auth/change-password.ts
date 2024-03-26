import { NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { UpdatePasswordFormData } from '@components/ChangePassword';
import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import password from '@models/password';

interface ChangePasswordRequest extends EnsureAuthenticatedRequest {
  body: UpdatePasswordFormData;
}

const resetPassword = async (
  req: ChangePasswordRequest,
  res: NextApiResponse
) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || !currentPassword) {
    return res.status(400).json({
      message: 'não foi possível redefinir a senha',
      code: 'invalid-inputs',
    });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({
      message: 'a nova senha deve ter no mínimo 6 caracteres',
      code: 'invalid-password-length',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: 'usuário não encontrado',
      code: 'user-not-found',
    });
  }

  const isSamePassword = await password.compare({
    providedPassword: currentPassword,
    storedPassword: user.password,
  });

  if (!isSamePassword) {
    return res.status(400).json({
      message: 'senha atual incorreta',
      code: 'invalid-password',
    });
  }

  const newPasswordHashed = await password.hash(newPassword);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: newPasswordHashed,
    },
  });

  return res.status(200).json({
    message: 'senha redefinida com sucesso',
    description: 'você já pode fazer login com a nova senha',
    code: 'password-change-success',
  });
};

export default ensureAuthenticated(resetPassword);
