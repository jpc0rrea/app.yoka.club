import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../components/Form/Input';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { errorToast } from '@components/Toast/ErrorToast';
import { successToast } from '@components/Toast/SuccessToast';
import { Loader2 } from 'lucide-react';
import useUser from '@hooks/useUser';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { PasswordInput } from '@components/Form/PasswordInput';

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
  const { user, fetchUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const createSessionResponse = await api.post<{
        message?: string;
        description?: string;
        actions?: string;
      }>('/sessions', {
        email: data.email,
        password: data.password,
      });

      console.log(createSessionResponse);

      if (createSessionResponse.status === 201) {
        await fetchUser();

        successToast({
          message: 'login realizado com sucesso',
          description: 'aproveite a plataforma :)',
        });

        router.push('/');
        return;
      }

      if (createSessionResponse.data.message) {
        errorToast({
          message: createSessionResponse.data.message,
          description:
            createSessionResponse.data.description ||
            createSessionResponse.data.actions,
        });

        router.push('/');
      }
    } catch (err) {
      const { message, description } = convertErrorMessage({ err });

      errorToast({
        message,
        description,
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

              <div>
                <PasswordInput
                  label="sua senha"
                  errorMessage={errors.password?.message}
                  {...register('password')}
                />

                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      href="/forgot-password"
                      className="font-medium text-brand-purple-900 hover:text-brand-purple-800"
                    >
                      esqueceu sua senha?
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex h-10 w-full justify-center rounded-md border border-transparent bg-brand-purple-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="mt-1 h-4 w-4 animate-spin" />
                  ) : (
                    'entrar'
                  )}
                </button>
              </div>
            </form>

            {/* <div className="mt-6">
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
                    className={`flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-500 shadow-sm hover:bg-gray-50 `}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_17_40)">
                        <path
                          d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                          fill="#4285F4"
                        />
                        <path
                          d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                          fill="#34A853"
                        />
                        <path
                          d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                          fill="#FBBC04"
                        />
                        <path
                          d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                          fill="#EA4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_17_40">
                          <rect width="48" height="48" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="ml-2 text-sm font-semibold">
                      entrar com o google
                    </span>
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
