import BuyMoreCheckIns from '@components/Modals/BuyMoreCheckIns';
import UserCantAccessPremiumSystemResourceAlert from '@components/Modals/UserCantAccessPremiumSystemResourceAlert';
import { errorToast } from '@components/Toast/ErrorToast';
import { successToast } from '@components/Toast/SuccessToast';
import useUser from '@hooks/useUser';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { queryClient } from '@lib/queryClient';
import getCheckInStatuses from '@lib/utilities/getCheckInStatuses';
import { EventFromAPI } from '@models/events/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CheckInButtonProps {
  event: EventFromAPI;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ event }) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { user, fetchUser } = useUser();

  const recordedUrl = event.recordedUrl;
  const liveUrl = event.liveUrl;

  const {
    alreadyCheckedIn,
    eventAlreadyStarted,
    canEnterTheEvent,
    stillHasVacancy,
    canViewRecordedEvent,
    canCheckIn,
  } = getCheckInStatuses({
    event,
    userId: user?.id || '',
    userCheckInsQuantity: user?.checkInsQuantity || 0,
    isUserSubscribed: user?.isSubscribed || false,
  });

  console.log({
    canCheckIn,
  });

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      await checkInAndUpdateUser();
      successToast({ message: 'check-in realizado com sucesso' });
    } catch (error) {
      const { message, description } = convertErrorMessage({ err: error });
      errorToast({ message, description });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const checkInAndUpdateUser = async () => {
    await api.post(`/events/check-in?eventId=${event.id}`);
    await fetchUser();
    await refetchQueryData();
  };

  const refetchQueryData = async () => {
    const queriesToRefetch = [
      ['events', { isLive: true }],
      ['events', 'byId', event.id],
      ['events'],
      ['events', 'next'],
    ];
    for (const queryKey of queriesToRefetch) {
      await queryClient.invalidateQueries({ queryKey });
    }
  };

  return renderButton();

  function renderButton() {
    if (eventAlreadyStarted && !canEnterTheEvent) {
      return recordedUrl ? (
        canViewRecordedEvent ? (
          linkButton(recordedUrl, 'ver aula gravada')
        ) : (
          <UserCantAccessPremiumSystemResourceAlert
            triggerButton={
              <button className="flex min-w-max max-w-fit justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none">
                ir para aula
              </button>
            }
            title="você não tem permissão para ver essa aula :("
            description="somente assinantes ou alunas que fizeram check-in podem ver a gravação dessa aula"
          />
        )
      ) : (
        disabledButton('link ainda não disponível')
      );
    }
    if (alreadyCheckedIn) {
      return liveUrl
        ? linkButton(liveUrl, 'ir para aula')
        : disabledButton('link ainda não disponível');
    }
    if (stillHasVacancy) {
      return canCheckIn ? (
        checkInButton()
      ) : (
        <BuyMoreCheckIns {...buyMoreProps} />
      );
    }
    return disabledButton('evento esgotado :(');
  }

  function linkButton(url: string, text: string) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonStyle}
      >
        {text}
      </a>
    );
  }

  function disabledButton(text: string) {
    return (
      <button disabled className={buttonStyle}>
        {text}
      </button>
    );
  }

  function checkInButton() {
    return (
      <button onClick={handleCheckIn} className={buttonStyle}>
        {isCheckingIn ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'agendar'
        )}
      </button>
    );
  }
};

export default CheckInButton;

// Tailwind utility class for button styling
const buttonStyle =
  'flex min-w-max max-w-fit justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none';

const buyMoreProps = {
  ctaText: 'agendar',
  title: 'você não tem mais check-ins disponíveis :(',
  description: 'Compre mais check-ins para agendar aula',
};
