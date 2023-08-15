import { format } from 'date-fns';
import Link from 'next/link';
import { UsersIcon, ClockIcon } from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
import { EventFromAPI } from 'pages/api/events/list';
import { useState } from 'react';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import { errorToast } from '@components/Toast/ErrorToast';
import { queryClient } from '@lib/queryClient';
import { Loader2 } from 'lucide-react';
// import { ClockIcon } from '@heroicons/react/24/outline';

interface EventProps {
  event: EventFromAPI;
}

export default function EventItem({ event }: EventProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const session = useSession();

  if (!event.startDate || !event.checkInsMaxQuantity) {
    return null;
  }

  const startDatetime = new Date(event.startDate);

  const userId = session.data?.user?.id || '';

  const alreadyCheckedId = event.checkIns
    .map((checkIn) => checkIn.userId)
    .includes(userId);

  const eventAlreadyStarted = event
    ? new Date(event?.startDate) < new Date()
    : false;

  const recordedUrl = event?.recordedUrl;

  const liveUrl = event?.liveUrl;

  const stillHasVacancy = event.checkIns.length < event.checkInsMaxQuantity;

  const handleCheckIn = async () => {
    setIsCheckingIn(true);

    try {
      const checkInResponse = await api.post<{
        checkInsRemaining: number;
      }>(`/events/check-in?eventId=${event.id}`);

      console.log(checkInResponse.data);

      session.update({
        ...session.data,
        user: {
          ...session.data?.user,
          checkInsQuantity: checkInResponse.data.checkInsRemaining,
        },
      });

      await queryClient.refetchQueries({
        queryKey: ['events', 'byId', event.id],
      });

      successToast({
        message: 'check-in realizado com sucesso',
      });
    } catch (err) {
      console.log(err);

      errorToast({
        message: 'erro ao realizar check-in',
      });
    }

    setIsCheckingIn(false);
  };

  return (
    <li
      key={event.id}
      className="group flex items-center space-x-4 rounded-xl px-4 py-2 focus-within:bg-gray-100"
    >
      <img
        src={event.instructor.image || ''}
        alt=""
        className="h-10 w-10 flex-none rounded-full"
      />
      <div className="flex-auto">
        <Link
          href={`/events/${event.id}`}
          className="truncate text-sm font-medium text-brand-purple-900 hover:text-brand-purple-800 hover:underline"
        >
          {event.title}
        </Link>
        <div className="mt-0.5 flex items-center">
          <p className="flex items-center text-sm text-gray-400">
            <ClockIcon
              className="mr-1 h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <time dateTime={new Date(event.startDate).toISOString()}>
              {format(startDatetime, "HH'h'mm")}
            </time>{' '}
          </p>
          <p className="ml-6 flex items-center text-sm text-gray-400">
            <UsersIcon
              className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <span>
              {event.checkIns.length}/{event.checkInsMaxQuantity}
            </span>{' '}
          </p>
        </div>
      </div>
      {eventAlreadyStarted ? (
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
      ) : alreadyCheckedId ? (
        liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
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
          className="flex w-20 justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
        >
          {isCheckingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
    </li>
  );
}
