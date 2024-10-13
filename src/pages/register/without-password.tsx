import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { Loader2 } from 'lucide-react';
import Confetti from '@components/Confetti';
import useUser from '@hooks/useUser';
import { api } from '@lib/api';
import { Button } from '@components/ui/button';

interface ActivationStatusProps {
  isLoading: boolean;
  isSuccess: boolean;
  message: string;
}

const StatusDisplay: React.FC<ActivationStatusProps> = ({
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
      {message.toLowerCase()}
    </h2>
  </div>
);

export default function ActiveUserWithoutPassword() {
  const router = useRouter();
  const { sessionToken } = router.query;
  const { isLoading, fetchUser } = useUser();

  // Use local storage to determine if the page should display the video or not.
  const [hasBeenActivated, setHasBeenActivated] = useState(
    (typeof window !== 'undefined' &&
      localStorage.getItem('activationComplete') === 'true') ||
      false
  );

  const [activationState, setActivationState] = useState({
    message: 'ativando sua conta...',
    description: 'aguarde um pouquinho. não deve demorar muito :)',
    buttonLabel: 'login',
    isSuccess: false,
    isFetching: true,
  });

  useEffect(() => {
    if (hasBeenActivated) {
      setActivationState((prev) => ({
        ...prev,
        isFetching: false,
        isSuccess: true,
        message: 'sua conta já foi ativada!',
        description: 'você já ganhou 1 aula ao vivo gratuita :)',
        buttonLabel: 'ver horários disponíveis',
      }));
      return;
    }
    const handleActivation = async () => {
      try {
        await api.patch('/sessions', { sessionToken });
        await fetchUser();
        setActivationState((prev) => ({
          ...prev,
          isFetching: false,
          isSuccess: true,
          message: 'sua conta foi ativada com sucesso!',
          description: 'você ganhou 1 aula ao vivo gratuita.',
          buttonLabel: 'ver horários disponíveis',
        }));
        localStorage.setItem('activationComplete', 'true');
        setHasBeenActivated(true);
      } catch (error) {
        setActivationState((prev) => ({
          ...prev,
          isFetching: false,
          isSuccess: false,
          message: 'algo deu errado na ativação da sua conta :(',
          description:
            'tente fazer login usando a senha que enviamos no seu e-mail',
          buttonLabel: 'ir para login',
        }));
      }
    };

    if (sessionToken && !hasBeenActivated) {
      handleActivation();
    }
  }, [sessionToken, fetchUser, hasBeenActivated]);

  const { message, description, buttonLabel, isSuccess, isFetching } =
    activationState;

  const navigate = () => {
    router.push(isSuccess ? '/' : '/login');
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="/images/yoka-club/yoka-horizontal-roxo.svg"
          alt="Logo Yoka Club"
          width={300}
          height={100}
          className="mx-auto"
        />
      </div>
      {isSuccess && <Confetti />}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <StatusDisplay
            isLoading={isLoading || isFetching}
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
              <div className="mt-4 aspect-video h-full w-full">
                <iframe
                  src="https://www.youtube.com/embed/E3csGvH4t6o"
                  title="agende sua aula com kaká"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="mx-auto h-full w-full"
                ></iframe>
              </div>
            </>
          )}
          {!(isLoading || isFetching) && (
            <Button
              variant="secondary"
              type="button"
              className="mt-6 flex w-full justify-center rounded-md border bg-brand-purple-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-700 focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2"
              onClick={navigate}
            >
              {buttonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
