import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Form/Input';
import { BeatLoader } from 'react-spinners';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { errorToast } from '@components/Toast/ErrorToast';
import { signIn, useSession } from 'next-auth/react';
import { successToast } from '@components/Toast/SuccessToast';

const loginFormSchema = z.object({
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
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function Login() {
  const router = useRouter();
  const session = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    const loginResponse = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: '/',
    });

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
        message: 'login realizado com sucesso',
        description: 'aproveite a plataforma :)',
      });
      router.push('/profile');
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
    } else {
      errorToast({
        message: 'aconteceu algo de errado',
        description: 'tente novamente mais tarde',
      });
    }
  };

  useEffect(() => {
    if (router.query.error && router.query.error === 'not-logged-in') {
      errorToast({
        message: 'faça login para acessar a plataforma',
      });
    }
  }, [router.query.error]);

  if (session.status === 'authenticated') {
    router.push('/profile');
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
            <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
              entre na plataforma
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              ou{' '}
              <Link
                href="/register"
                className="font-medium text-brand-purple-900 hover:text-brand-purple-800"
              >
                faça seu cadastro
              </Link>
            </p>
            <form className="space-y-6" onSubmit={handleSubmit(handleLogin)}>
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

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-brand-purple-900 hover:text-brand-purple-800"
                  >
                    esqueceu sua senha?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-brand-purple-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
                >
                  {isSubmitting ? (
                    <BeatLoader
                      color="#fff"
                      size={7}
                      cssOverride={{
                        height: '1.25rem',
                      }}
                      className="translate-y-[4px] transform"
                    />
                  ) : (
                    'entrar'
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
                    className={`flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-gray-500 shadow-sm hover:bg-gray-50 `}
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
                      entrar com o google
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
