import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { Loader2 } from 'lucide-react';

import Confetti from '@components/Confetti';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import useUser from '@hooks/useUser';

export default function ActiveUser() {
  const router = useRouter();
  const { fetchUser } = useUser();
  const { tokenId } = router.query;

  const [globalMessage, setGlobalMessage] = useState('ativando sua conta...');
  const [globalDescription, setGlobalDescription] = useState(
    'aguarde um pouquinho. não deve demorar muito :)'
  );
  const [buttonText, setButtonText] = useState('login');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleActivateUser = async (token: string) => {
    try {
      setIsLoading(true);

      const response = await api.patch('/user/activate', { token });

      if (response.status === 200) {
        setIsSuccess(true);
        setGlobalMessage('sua conta foi ativada com sucesso!');
        setGlobalDescription(
          'você ganhou 1 check-in para testar a plataforma. aproveite!'
        );
        setButtonText('ir para a página inicial');
        await fetchUser();

        return;
      }

      if (response.status >= 400 && response.status <= 503) {
        const responseBody = response.data;
        setGlobalMessage(`${responseBody.message}`);
        setGlobalDescription(
          `${responseBody.description || responseBody.action}`
        );
        setButtonText('ir para login');
        setIsSuccess(false);
        return;
      }

      setIsSuccess(false);
      throw new Error(response.statusText);
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });
      setGlobalMessage(message);
      if (description) setGlobalDescription(description);
      setButtonText('ir para login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tokenId) {
      handleActivateUser(tokenId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId]);

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
            {isLoading ? (
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
                    router.push('/');
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
