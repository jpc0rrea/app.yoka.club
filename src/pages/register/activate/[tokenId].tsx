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

// Subcomponent updated for more accurate status indication
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
  const posthog = usePostHog();

  // Use local storage to determine if the page should display the video or not.
  const [hasBeenActivated, setHasBeenActivated] = useState(
    (typeof window !== 'undefined' &&
      localStorage.getItem('activationComplete') === 'true') ||
      false
  );

  const [activationDetails, setActivationDetails] = useState({
    message: 'ativando sua conta...',
    description: 'aguarde um pouquinho. não deve demorar muito :)',
    buttonLabel: 'login',
    isSuccess: false,
    isLoading: true,
  });

  async function handleActivateUser(token: string) {
    try {
      const response = await api.patch('/user/activate', { token });
      if (response.status !== 200) throw new Error('activation failed');

      const userInfo = await fetchUser();
      posthog?.capture('onboarding:activate_account', {
        email: userInfo?.email || 'unknown',
        id: userInfo?.id || 'unknown',
      });

      setActivationDetails({
        message: 'sua conta foi ativada com sucesso!',
        description: 'você ganhou 1 aula ao vivo gratuita.',
        buttonLabel: 'ver horários disponíveis',
        isSuccess: true,
        isLoading: false,
      });

      localStorage.setItem('activationComplete', 'true');
      setHasBeenActivated(true);
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
  }

  useEffect(() => {
    if (!tokenId) return;
    if (hasBeenActivated) {
      setActivationDetails({
        message: 'sua conta já foi ativada!',
        description: 'você já ganhou 1 aula ao vivo gratuita :)',
        buttonLabel: 'ver horários disponíveis',
        isSuccess: true,
        isLoading: false,
      });
      return;
    }
    handleActivateUser(tokenId as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, hasBeenActivated]);

  const { message, description, buttonLabel, isSuccess, isLoading } =
    activationDetails;

  return (
    <div className="flex min-h-full flex-col justify-center bg-white py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="/logo-yoga-com-kaka-roxo.png"
          alt="Logo grupo r3"
          width={300}
          height={100}
          className="mx-auto"
        />
        {isSuccess && <Confetti />}
      </div>
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
          {isSuccess && (
            <>
              <p className="mt-0.5 text-center text-sm text-gray-600">
                assista o vídeo para entender como agendar uma aula:
              </p>
              <div className="mt-4 max-w-none text-sm text-gray-600">
                <iframe
                  src="https://www.youtube.com/embed/E3csGvH4t6o"
                  title="agende sua aula com a kaká"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="mx-auto my-2 aspect-video w-full"
                ></iframe>
              </div>
            </>
          )}
          {!isLoading && (
            <button
              type="button"
              className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-brand-purple-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2"
              onClick={() => router.push(isSuccess ? '/' : '/login')}
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
