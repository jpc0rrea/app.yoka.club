import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Form/Input';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { errorToast } from '@components/Toast/ErrorToast';
import { successToast } from '@components/Toast/SuccessToast';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { Loader2 } from 'lucide-react';
import useUser from '@hooks/useUser';

const resetPasswordFormSchema = z
  .object({
    password: z
      .string({
        required_error: 'senha é obrigatório',
      })
      .min(6, {
        message: 'senha deve ter no mínimo 6 caracteres',
      }),
    passwordConfirmation: z
      .string({
        required_error: 'confirmação de senha é obrigatório',
      })
      .min(6, {
        message: 'confirmação de senha deve ter no mínimo 6 caracteres',
      }),
  })
  .superRefine(({ password, passwordConfirmation }, ctx) => {
    if (password !== passwordConfirmation) {
      ctx.addIssue({
        code: 'custom',
        message: 'senhas não conferem',
        path: ['passwordConfirmation'],
      });
    }
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

export default function ForgotPassword() {
  const router = useRouter();
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
  });
  const [hasResetedPassword, setHasResetedPassword] = useState(false);

  const handleForgotPassword = async (data: ResetPasswordFormData) => {
    if (router.query.token) {
      try {
        const forgotPasswordResponse = await api.post('/auth/reset-password', {
          password: data.password,
          token: router.query.token,
        });

        console.log(forgotPasswordResponse);

        successToast({
          message: 'senha redefinida com sucesso',
          description: 'você já pode fazer login com a nova senha',
        });

        setHasResetedPassword(true);
      } catch (err) {
        const { message, description } = convertErrorMessage({
          err,
        });

        errorToast({
          message,
          description,
        });
      }
    } else {
      errorToast({
        message: 'token inválido',
        description: 'solicite novamente a alteração de senha',
      });
    }
  };

  if (user) {
    router.push('/');
  }

  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            className="mx-auto h-12 w-auto"
            src="/logo-yoga-com-kaka-roxo.png"
            alt="Logo grupo r3"
            width={300}
            height={100}
          />
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            {hasResetedPassword ? (
              <>
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                  sua senha foi redefinida
                </h2>

                <p className="mt-1 text-center text-sm text-gray-600">
                  faça login usando a nova senha
                </p>

                <a
                  href="/login"
                  className="mt-6 flex w-full justify-center rounded-md border border-transparent bg-brand-purple-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
                >
                  ir para o login
                </a>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                  redefinição de senha
                </h2>

                <form
                  className="mt-4 space-y-6"
                  onSubmit={handleSubmit(handleForgotPassword)}
                >
                  <Input
                    label="sua nova senha"
                    type="password"
                    errorMessage={errors.password?.message}
                    {...register('password')}
                  />

                  <Input
                    label="confirmação da nova senha"
                    type="password"
                    errorMessage={errors.passwordConfirmation?.message}
                    {...register('passwordConfirmation')}
                  />

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md border border-transparent bg-brand-purple-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'cadastrar nova senha'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <p className="mt-2 text-sm text-gray-600">
                      lembrou sua senha?{' '}
                      <Link
                        href="/login"
                        className="font-medium text-brand-purple-900 hover:text-brand-purple-800"
                      >
                        faça login
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
