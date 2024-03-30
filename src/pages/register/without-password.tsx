import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { Loader2 } from 'lucide-react';

import Confetti from '@components/Confetti';
import useUser from '@hooks/useUser';
import { api } from '@lib/api';

export default function ActiveUserWithoutPassword() {
  const router = useRouter();
  const { sessionToken } = router.query;
  const { user, isLoading, fetchUser } = useUser();

  const [globalMessage, setGlobalMessage] = useState('ativando sua conta...');
  const [globalDescription, setGlobalDescription] = useState(
    'aguarde um pouquinho. não deve demorar muito :)'
  );
  const [buttonText, setButtonText] = useState('login');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (sessionToken) {
      const handleFetchUser = async () => {
        await api.patch('/sessions', {
          sessionToken,
        });

        await fetchUser();
        setIsFetching(false);
      };

      handleFetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (user) {
      setIsSuccess(true);
      setGlobalMessage('sua conta foi ativada com sucesso!');
      setGlobalDescription(
        'você ganhou 1 check-in para testar a plataforma. aproveite!'
      );
      setButtonText('ir para a página inicial');

      return;
    }

    setGlobalMessage('algo deu errado na ativação da sua conta :(');
    setGlobalDescription(
      'tente fazer login usando a senha que enviamos no seu e-mail'
    );
    setButtonText('ir para login');
    setIsSuccess(false);
  }, [isLoading, user, isFetching]);

  return (
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

      {isSuccess && (
        <div>
          <Confetti />
        </div>
      )}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="flex items-center justify-center">
            {isLoading || isFetching ? (
              <Loader2 className="mr-2 mt-1 h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <CheckCircleIcon className="mt-1 h-5 w-5 text-green-400" />
            ) : (
              <XCircleIcon className="mt-1 h-5 w-5 text-red-400" />
            )}
            <h2 className="ml-3 text-center text-xl font-bold tracking-tight text-gray-900">
              {globalMessage}
            </h2>
          </div>
          <div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {globalDescription}
            </p>
          </div>
          {!isLoading && (
            <div className="mt-6">
              <button
                type="button"
                className="flex w-full justify-center rounded-md border border-transparent bg-brand-purple-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2"
                onClick={() => {
                  if (isSuccess) {
                    router.push('/?firstTime=true');
                  } else {
                    router.push('/login');
                  }
                }}
              >
                {buttonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
