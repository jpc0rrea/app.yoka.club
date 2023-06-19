import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, useSession } from 'next-auth/react';
import { BeatLoader } from 'react-spinners';

import { Input } from '@components/Form/Input';
import { successToast } from '@components/Toast/SuccessToast';
import { errorToast } from '@components/Toast/ErrorToast';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { api } from '@lib/api';
import { isAxiosError } from 'axios';

const registerFormSchema = z
  .object({
    fullName: z
      .string({
        required_error: 'nome completo é obrigatório',
      })
      .min(6, {
        message: 'nome completo deve ter no mínimo 6 caracteres',
      }),
    email: z
      .string({
        required_error: 'e-mail é obrigatório',
      })
      .email('e-mail inválido'),
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

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function Login() {
  const router = useRouter();
  const session = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await api.post('/users/register', {
        email: data.email,
        password: data.password,
        name: data.fullName,
      });

      const loginResponse = await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: '/',
        redirect: false,
      });

      console.log('LOGIN RESPONSE');
      console.log(loginResponse);

      if (!loginResponse) {
        errorToast({
          message: 'algum erro aconteceu',
          description: 'tente novamente mais tarde',
        });

        return;
      }

      if (loginResponse.ok) {
        successToast({
          message: 'usuário criado com sucesso',
          description: 'aproveite a plataforma :)',
        });
        router.push('/');
      } else if (loginResponse.error === 'invalid-credentials') {
        errorToast({
          message: 'e-mail ou senha incorretos',
        });

        return;
      } else if (loginResponse.error === 'invalid-login-method') {
        errorToast({
          message: 'método de login inválido',
          description: 'tente fazer login usando o google',
        });

        return;
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        if (err.response.data.code === 'user-already-exists') {
          errorToast({
            message: 'e-mail já cadastrado',
            description: 'tente fazer login ou recupere sua senha',
          });
          return;
        }
      }
      errorToast({
        message: 'falha ao criar usuário',
        description: 'tente novamente mais tarde',
      });
    }
  };

  const hasCalendarError = !!router.query.error;

  useEffect(() => {
    if (hasCalendarError) {
      errorToast({
        message: 'falha ao se conectar com o google',
        description:
          'veja se você habilitou as permissões de acesso ao google calendar',
      });
    }
  }, [hasCalendarError]);

  if (session.status === 'authenticated') {
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
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              crie sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              já possui uma conta?{' '}
              <Link
                href="/login"
                className="font-medium text-brand-purple-900 hover:text-brand-purple-800"
              >
                entre
              </Link>
            </p>
            <form
              className="mt-6 space-y-6"
              onSubmit={handleSubmit(handleRegister)}
            >
              <Input
                label="seu nome completo"
                type="text"
                errorMessage={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="seu e-mail"
                type="email"
                errorMessage={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="sua senha"
                type="password"
                errorMessage={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="confirme sua senha"
                type="password"
                errorMessage={errors.passwordConfirmation?.message}
                {...register('passwordConfirmation')}
              />

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-brand-purple-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
                >
                  {isSubmitting ? (
                    <BeatLoader
                      color="#ffffff"
                      size={7}
                      cssOverride={{
                        height: '1.25rem',
                      }}
                      className="translate-y-[4px] transform"
                    />
                  ) : (
                    'criar conta'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="w-full">
                  <button
                    onClick={() => {
                      signIn('google', {
                        callbackUrl: '/',
                      });
                    }}
                    className={`flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-500 shadow-sm hover:bg-gray-50 ${
                      hasCalendarError
                        ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7.9 7v2.4H12c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C11.5 1.7 9.9 1 8 1 4.1 1 1 4.1 1 8s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H7.9z" />
                    </svg>
                    <span className="ml-2 text-sm font-semibold">
                      criar conta com o google
                    </span>
                  </button>

                  {hasCalendarError && (
                    <p className="mt-2 text-sm text-red-600">
                      falha ao se conectar com o google. veja se você habilitou
                      as permissões de acesso ao google calendar
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
