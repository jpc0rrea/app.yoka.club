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
import { sleep } from '@lib/utils';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface URLParameter {
  collection_id: string;
  collection_status: string;
  payment_id: string;
  status: string;
  external_reference: string;
  payment_type: string;
  merchant_order_id: string;
  preference_id: string;
  site_id: string;
  processing_mode: string;
  merchant_account_id: string;
}

export default function PaymentDone() {
  const router = useRouter();
  const { fetchUser } = useUser();

  const [globalMessage, setGlobalMessage] = useState(
    'conferindo o seu pagamento...'
  );
  const [globalDescription, setGlobalDescription] = useState(
    'aguarde um pouquinho. não deve demorar muito :)'
  );
  const [buttonText, setButtonText] = useState('home');
  const [isApproved, setIsApproved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { payment_id } = router.query as unknown as URLParameter;

  useEffect(() => {
    const handleCheckPayment = async () => {
      try {
        setIsLoading(true);

        await sleep(1000);

        const response = await api.get<{
          status?:
            | 'checking'
            | 'approved'
            | 'pending'
            | 'in_process'
            | 'rejected'
            | 'refunded'
            | 'cancelled'
            | 'charged_back'
            | 'error';
          message?: string;
          description?: string;
          action?: string;
        }>('/mercadopago/payment', {
          params: {
            payment_id,
          },
        });

        if (response.status === 200 && response.data.status) {
          if (response.data.status === 'approved') {
            setIsApproved(true);
            setGlobalMessage('os check-ins foram adicionados com sucesso');
            setGlobalDescription(
              'você já está com acesso a todos os conteúdos exclusivos. aproveite!'
            );
            setButtonText('ir para a página inicial');
            queryClient.invalidateQueries(['userPlan']);
            await fetchUser();

            return;
          } else {
            setIsPending(true);
            setGlobalMessage('seu pagamento está sendo processado');
            setGlobalDescription(
              'assim que o pagamento for confirmado, seus check-ins serão adicionados :)'
            );
            setButtonText('ir para o seu extrato de check-ins');
          }
        }

        if (response.status >= 400 && response.status <= 503) {
          const responseBody = response.data;
          setGlobalMessage(`${responseBody.message}`);
          setGlobalDescription(
            `${responseBody.description || responseBody.action}`
          );
          setButtonText('ir para a página inicial');
          setIsApproved(false);
          return;
        }

        setIsApproved(false);
        throw new Error(response.statusText);
      } catch (err) {
        const { message, description } = convertErrorMessage({
          err,
        });
        setGlobalMessage(message);
        if (description) setGlobalDescription(description);
        setButtonText('ir para a página inicial');
      } finally {
        setIsLoading(false);
      }
    };

    if (payment_id) {
      handleCheckPayment();
    }
  }, [payment_id, fetchUser]);

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

      {isApproved && (
        <div>
          <Confetti />
        </div>
      )}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="mr-2 mt-1 h-4 w-4 animate-spin" />
            ) : isPending ? (
              <ExclamationCircleIcon
                className="mt-1 h-5 w-5 text-gray-500"
                aria-hidden="true"
              />
            ) : isApproved ? (
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
                  if (isApproved) {
                    router.push('/extract');
                  } else {
                    router.push('/');
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
