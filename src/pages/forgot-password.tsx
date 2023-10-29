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

const forgotPasswordFormSchema = z.object({
  email: z
    .string({
      required_error: 'e-mail é obrigatório',
    })
    .email('e-mail inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;

export default function ForgotPassword() {
  const router = useRouter();
  const { user } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });
  const [hasSentMail, setHasSentMail] = useState(false);
  const [mail, setMail] = useState('');

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      const forgotPasswordResponse = await api.post('/auth/forgot-password', {
        email: data.email,
      });

      console.log(forgotPasswordResponse);

      successToast({
        message: 'e-mail enviado com sucesso',
        description: 'verifique sua caixa de entrada',
      });

      setMail(data.email);
      setHasSentMail(true);
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
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
            {hasSentMail ? (
              <>
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                  verifique seu e-mail
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  enviamos um link para redefinir sua senha para o e-mail{' '}
                  <span className="font-medium text-brand-purple-900">
                    {mail}
                  </span>
                </p>
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
                    label="seu e-mail"
                    type="email"
                    errorMessage={errors.email?.message}
                    {...register('email')}
                  />

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md border border-transparent bg-brand-purple-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'enviar link por e-mail'
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
