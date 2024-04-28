import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { Loader2 } from 'lucide-react';
import Confetti from '@components/Confetti';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import useUser from '@hooks/useUser';
import { usePostHog } from 'posthog-js/react';

interface ActivationStatusProps {
  isLoading: boolean;
  isSuccess: boolean;
  message: string;
}

// Subcomponent for displaying success/error icons and messages
const ActivationStatus: React.FC<ActivationStatusProps> = ({
  isLoading,
  isSuccess,
  message,
}) => (
  <div className="flex items-center justify-center">
    {isLoading ? (
      <Loader2 className="mr-2 mt-1 h-4 w-4 animate-spin" />
    ) : isSuccess ? (
      <CheckCircleIcon className="mt-1 h-5 w-5 text-green-400" />
    ) : (
      <XCircleIcon className="mt-1 h-5 w-5 text-red-400" />
    )}
    <h2 className="ml-3 text-center text-xl font-bold tracking-tight text-gray-900">
      {message}
    </h2>
  </div>
);

export default function ActiveUser() {
  const router = useRouter();
  const { fetchUser } = useUser();
  const { tokenId } = router.query;
  const [activationDetails, setActivationDetails] = useState({
    message: 'ativando sua conta...',
    description: 'aguarde um pouquinho. não deve demorar muito :)',
    buttonLabel: 'login',
    isSuccess: false,
    isLoading: true,
  });
  const posthog = usePostHog();

  const handleActivateUser = async (token: string) => {
    try {
      const response = await api.patch('/user/activate', { token });

      if (response.status === 200) {
        const userInfo = await fetchUser();

        posthog?.capture('user_activated', {
          email: userInfo?.email || 'unknown',
          id: userInfo?.id || 'unknown',
        });
        setActivationDetails({
          message: 'sua conta foi ativada com sucesso!',
          description:
            'você ganhou 1 check-in para testar a plataforma. aproveite!',
          buttonLabel: 'ir para a página inicial',
          isSuccess: true,
          isLoading: false,
        });
        return;
      }

      throw new Error('Activation failed');
    } catch (err) {
      const { message, description } = convertErrorMessage({ err });
      setActivationDetails({
        message,
        description: description || 'algo deu errado. tente novamente.',
        buttonLabel: 'ir para login',
        isSuccess: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    if (tokenId) {
      handleActivateUser(tokenId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId]);

  const { message, description, buttonLabel, isSuccess, isLoading } =
    activationDetails;

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="/logo-yoga-com-kaka-roxo.png"
          alt="Logo grupo r3"
          width={300}
          height={100}
          className="mx-auto"
        />
      </div>
      {isSuccess && <Confetti />}
      {isSuccess && (
        <div className="aspect-video h-full w-full">
          <iframe
            // width="560"
            // width="1120"
            // height="315"
            // height="630"
            src="https://www.youtube.com/embed/E3csGvH4t6o"
            title="agende sua aula com a kaká"
            // frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            className="mx-auto h-[70%] w-[70%] sm:h-[70%] sm:w-[70%]"
            // allowfullscreen
          ></iframe>
        </div>
      )}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <ActivationStatus
            isLoading={isLoading}
            isSuccess={isSuccess}
            message={message}
          />
          <p className="mt-2 text-center text-sm text-gray-600">
            {description}
          </p>
          {!isLoading && (
            <button
              type="button"
              className="flex w-full justify-center rounded-md border border-transparent bg-brand-purple-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2"
              onClick={() =>
                router.push(isSuccess ? '/?firstTime=true' : '/login')
              }
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
