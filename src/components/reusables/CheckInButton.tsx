import { errorToast } from '@components/Toast/ErrorToast';
import { successToast } from '@components/Toast/SuccessToast';
import useUser from '@hooks/useUser';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { queryClient } from '@lib/queryClient';
import getCheckInStatuses from '@lib/utilities/getCheckInStatuses';
import { Loader2 } from 'lucide-react';
import { EventFromAPI } from 'pages/api/events/list';
import { useState } from 'react';

interface CheckInButtonProps {
  event: EventFromAPI;
}

export default function CheckInButton({ event }: CheckInButtonProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { user, fetchUser } = useUser();

  const userId = user?.id || '';

  const userCheckInsQuantity = user?.checkInsQuantity || 0;

  if (!event.startDate || !event.checkInsMaxQuantity) {
    return null;
  }

  const {
    alreadyCheckedIn,
    eventAlreadyStarted,
    canEnterTheEvent,
    stillHasVacancy,
  } = getCheckInStatuses({
    event,
    userId,
    userCheckInsQuantity,
  });

  const recordedUrl = event?.recordedUrl;

  const liveUrl = event?.liveUrl;

  const handleCheckIn = async () => {
    setIsCheckingIn(true);

    try {
      await api.post<{
        checkInsRemaining: number;
      }>(`/events/check-in?eventId=${event.id}`);

      await fetchUser();

      queryClient.invalidateQueries({
        queryKey: [
          'events',
          {
            isLive: true,
          },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ['events', 'byId', event.id],
      });

      await queryClient.refetchQueries({
        queryKey: [
          'events',
          {
            isLive: true,
          },
        ],
      });
      await queryClient.refetchQueries({
        queryKey: ['events', 'byId', event.id],
      });

      successToast({
        message: 'check-in realizado com sucesso',
      });
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
      });
    }

    setIsCheckingIn(false);
  };

  return (
    <>
      {eventAlreadyStarted && !canEnterTheEvent ? (
        recordedUrl ? (
          <a
            href={recordedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
          >
            ver aula gravada
          </a>
        ) : (
          <button
            disabled
            className="flex justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
          >
            link ainda não disponível
          </button>
        )
      ) : alreadyCheckedIn ? (
        liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-24 justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
          >
            ir para aula
          </a>
        ) : (
          <button
            disabled
            className="flex justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
          >
            link ainda não disponível
          </button>
        )
      ) : stillHasVacancy ? (
        <button
          onClick={handleCheckIn}
          className="flex h-7 w-20 justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
        >
          {isCheckingIn ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'check-in'
          )}
        </button>
      ) : (
        <button
          disabled
          className="flex justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
        >
          evento esgotado :(
        </button>
      )}
    </>
  );
}
