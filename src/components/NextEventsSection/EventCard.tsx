import Link from 'next/link';

import { Button } from '@components/ui/button';
import { EventFromAPI } from '@models/events/types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import useUser from '@hooks/useUser';
import { useState } from 'react';
import getCheckInStatuses from '@lib/utilities/getCheckInStatuses';
import { api } from '@lib/api';
import { queryClient } from '@lib/queryClient';
import { successToast } from '@components/Toast/SuccessToast';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import UserCantViewRecordedClassAlert from '@components/Modals/UserCantViewRecordedEventAlert';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';

interface EventCardProps {
  event: EventFromAPI;
}

export default function EventCard({ event }: EventCardProps) {
  const { user, fetchUser } = useUser();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCancellingCheckIn, setIsCancellingCheckIn] = useState(false);

  const userId = user?.id || '';

  const userCheckInsQuantity = user?.checkInsQuantity || 0;

  if (!event || !event.startDate || !event.checkInsMaxQuantity) {
    return null;
  }

  const {
    alreadyCheckedIn,
    eventAlreadyStarted,
    stillHasVacancy,
    canCancelCheckIn,
    canEnterTheEvent,
    canViewRecordedEvent,
  } = getCheckInStatuses({
    event,
    userId,
    userCheckInsQuantity,
    isUserSubscribed: user?.isSubscribed || false,
  });

  const recordedUrl = event?.recordedUrl;

  const liveUrl = event?.liveUrl;

  const handleCancelCheckIn = async () => {
    setIsCancellingCheckIn(true);

    try {
      await api.delete<{
        checkInsRemaining: number;
      }>(`/events/cancel-check-in?eventId=${event.id}`);

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

      queryClient.invalidateQueries({
        queryKey: ['events', 'next'],
      });

      successToast({
        message: 'check-in cancelado com sucesso',
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

    setIsCancellingCheckIn(false);
  };

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
        queryKey: ['events'],
      });
      await queryClient.refetchQueries({
        queryKey: ['events', 'next'],
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
    <div className="flex w-64 flex-none flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Link href={`/events/${event.id}`}>
                    <h3 className="line-clamp-2 h-14 cursor-pointer overflow-hidden text-ellipsis text-left text-lg font-semibold text-brand-purple-900 transition-all hover:text-brand-purple-900 hover:underline dark:text-white">
                      {event.title}
                    </h3>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{event.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            instrutor:{' '}
            <strong className="text-gray-600">
              {event.instructor.displayName}
            </strong>
          </p> */}
          {alreadyCheckedIn ? (
            <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-700 dark:text-green-100">
              check-in realizado :)
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center rounded-full  px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100"></span>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            data:{' '}
            <strong className="text-gray-600">
              {format(new Date(event.startDate), "ccc', 'dd/MM' às 'HH:mm", {
                locale: ptBR,
              })}
            </strong>
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            duração:{' '}
            <strong className="text-gray-600">{event.duration} minutos</strong>
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            check-ins restantes:{' '}
            <strong className="text-gray-600">
              {event.checkInsMaxQuantity - event.checkIns.length}
            </strong>
          </p>
        </div>
        <div>
          {alreadyCheckedIn && liveUrl && canCancelCheckIn ? (
            <Button className="mt-4 w-full" variant="default" asChild>
              <Link href={liveUrl} target="_blank" rel="noopener noreferrer">
                ir para aula
              </Link>
            </Button>
          ) : (
            <Button asChild className="mt-4 w-full" variant="secondary">
              <Link href={`/events/${event.id}`}>ver detalhes</Link>
            </Button>
          )}
          {eventAlreadyStarted && !canEnterTheEvent ? (
            recordedUrl ? (
              canViewRecordedEvent ? (
                <Button className="mt-2 w-full" variant="default" asChild>
                  <Link
                    href={recordedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ver aula gravada
                  </Link>
                </Button>
              ) : (
                <UserCantViewRecordedClassAlert />
              )
            ) : (
              <Button disabled className="mt-2 w-full" variant="default">
                link ainda não disponível
              </Button>
            )
          ) : alreadyCheckedIn ? (
            liveUrl && canCancelCheckIn ? (
              <Button
                className="mt-2 w-full"
                variant="destructive"
                onClick={handleCancelCheckIn}
                disabled={isCancellingCheckIn}
              >
                {isCancellingCheckIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'cancelar check-in'
                )}
              </Button>
            ) : liveUrl ? (
              <Button className="mt-2 w-full" variant="default" asChild>
                <Link href={liveUrl} target="_blank" rel="noopener noreferrer">
                  ir para aula
                </Link>
              </Button>
            ) : (
              <Button disabled className="mt-2 w-full" variant="default">
                link ainda não disponível
              </Button>
            )
          ) : stillHasVacancy ? (
            <Button
              onClick={handleCheckIn}
              className="mt-2 w-full"
              variant="default"
              disabled={isCheckingIn}
            >
              {isCheckingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'fazer check-in'
              )}
            </Button>
          ) : (
            <Button disabled className="mt-2 w-full" variant="default">
              evento esgotado :(
            </Button>
          )}
          {/* <Button className="mt-2 w-full" variant="default">
            fazer check-in
          </Button> */}
        </div>
      </div>
    </div>
  );
}
