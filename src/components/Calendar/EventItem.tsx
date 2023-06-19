import { Event } from '.';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { UsersIcon, ClockIcon } from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
// import { ClockIcon } from '@heroicons/react/24/outline';

interface EventProps {
  event: Event;
}

export default function EventItem({ event }: EventProps) {
  const startDatetime = parseISO(event.startDatetime);

  const session = useSession();

  const userIdsWhoCheckedIn = event.usersWhoCheckedIn.map((user) => user.id);

  return (
    <li
      key={event.id}
      className="group flex items-center space-x-4 rounded-xl py-2 px-4 focus-within:bg-gray-100"
    >
      <img
        src={event.instructorImageUrl}
        alt=""
        className="h-10 w-10 flex-none rounded-full"
      />
      <div className="flex-auto">
        <Link
          href={`/events/${event.id}`}
          className="truncate text-sm font-medium text-brand-purple-900 hover:text-brand-purple-800 hover:underline"
        >
          {event.name}
        </Link>
        <div className="mt-0.5 flex items-center">
          <p className="flex items-center text-sm text-gray-400">
            <ClockIcon
              className="mr-1 h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <time dateTime={event.startDatetime}>
              {format(startDatetime, "HH'h'mm")}
            </time>{' '}
          </p>
          <p className="ml-6 flex items-center text-sm text-gray-400">
            <UsersIcon
              className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <span>
              {event.checkInsQuantity}/{event.checkInsMaxQuantity}
            </span>{' '}
          </p>
        </div>
      </div>
      {userIdsWhoCheckedIn.includes(session?.data?.user?.id || '') ? (
        <button className="flex justify-center rounded-md border border-transparent bg-brand-purple-900 py-1 px-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none">
          ir para aula
        </button>
      ) : (
        <button className="flex justify-center rounded-md border border-transparent bg-brand-purple-900 py-1 px-2 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none">
          check-in
        </button>
      )}
    </li>
  );
}
