import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PasswordInput } from '@components/Form/PasswordInput';
import { Loader2 } from 'lucide-react';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';

const updatePasswordFormSchema = z.object({
  currentPassword: z
    .string({
      required_error: 'senha atual é obrigatório',
    })
    .min(6, {
      message: 'a senha atual deve ter no mínimo 6 caracteres',
    }),
  newPassword: z
    .string({
      required_error: 'nova senha é obrigatório',
    })
    .min(6, {
      message: 'a nova senha deve ter no mínimo 6 caracteres',
    }),
});

export type UpdatePasswordFormData = z.infer<typeof updatePasswordFormSchema>;

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordFormSchema),
  });

  async function handleUpdateProfile(data: UpdatePasswordFormData) {
    try {
      console.log(data);
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      successToast({
        message: 'senha atualizada com sucesso',
      });
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
      });
    }
  }
  return (
    <form onSubmit={handleSubmit(handleUpdateProfile)}>
      <h3 className="text-lg font-medium leading-6 text-gray-900">senha</h3>
      <p className="mt-1 text-sm text-gray-500">
        troque a senha da sua conta :)
      </p>
      <div className="mt-6 max-w-sm">
        <PasswordInput
          label="senha atual"
          errorMessage={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
      </div>
      <div className="mt-4 max-w-sm">
        <PasswordInput
          label="nova senha"
          errorMessage={errors.newPassword?.message}
          {...register('newPassword')}
        />
      </div>
      <button
        type="submit"
        className="mt-6 inline-flex w-32 justify-center rounded-md border border-transparent bg-purple-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-900 "
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'trocar senha'
        )}
      </button>
    </form>
  );
}
