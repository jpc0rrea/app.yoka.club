import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { Loader2 } from 'lucide-react';

import Confetti from '@components/Confetti';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import useUser from '@hooks/useUser';
import { queryClient } from '@lib/queryClient';
import { UserPlan } from '@hooks/useUserPlan';
import { sleep } from '@lib/utils';
import { Button } from '@components/ui/button';
import { trackPurchase } from '@utils/facebook-tracking';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export default function SubscriptionActivation() {
  const router = useRouter();
  const { fetchUser, user } = useUser();
  const { sessionToken } = router.query;

  const [globalMessage, setGlobalMessage] = useState(
    'ativando sua assinatura...'
  );
  const [globalDescription, setGlobalDescription] = useState(
    'aguarde um pouquinho. não deve demorar muito :)'
  );
  const [buttonText, setButtonText] = useState('home');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlanWithRetry = async (
    retries = 0
  ): Promise<{
    plan: UserPlan;
    message: string;
    description: string;
    action: string;
  } | null> => {
    try {
      const response = await api.get<{
        plan: UserPlan;
        message: string;
        description: string;
        action: string;
      }>('/user/plan');

      if (response.status === 200 && response.data.plan.type === 'premium') {
        return response.data;
      }

      throw new Error('Plan fetch unsuccessful');
    } catch (error) {
      if (retries < MAX_RETRIES - 1) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
        await sleep(retryDelay);
        return await fetchPlanWithRetry(retries + 1);
      }
      return null;
    }
  };

  const handleActivateSubscription = async ({
    sessionToken,
  }: {
    sessionToken?: string | string[] | undefined;
  }) => {
    try {
      if (sessionToken) {
        localStorage.setItem('activationComplete', 'true');
        await api.patch('/sessions', { sessionToken });
        await fetchUser();
      }
      setIsLoading(true);

      await sleep(3000);

      const planData = await fetchPlanWithRetry();

      if (planData) {
        setIsSuccess(true);
        setGlobalMessage('sua assinatura foi feita com sucesso!');
        setGlobalDescription(
          'você já está com acesso a todos os conteúdos exclusivos. aproveite!'
        );
        setButtonText('ir para a página inicial');
        queryClient.invalidateQueries(['userPlan']);
        const freshUser = await fetchUser();
        trackPurchase({
          value: planData.plan.price,
          currency: 'BRL',
          customData: {
            content_name: planData.plan.name,
            content_category: planData.plan.type,
            content_ids: [planData.plan.id],
          },
          userData:
            freshUser || user
              ? {
                  email: (freshUser || user)!.email,
                  first_name: (freshUser || user)!.name.split(' ')[0],
                  last_name: (freshUser || user)!.name.split(' ')[1],
                }
              : undefined,
        });
        return;
      }

      setIsSuccess(false);
      throw new Error('Failed to fetch plan after multiple attempts');
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
    handleActivateSubscription({ sessionToken });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken]);

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto h-12 w-auto"
          src="/images/yoka-club/yoka-horizontal-roxo.svg"
          alt="Logo Yoka Club"
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
              <Button
                variant="secondary"
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
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
