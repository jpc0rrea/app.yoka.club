import { format } from 'date-fns';
import Link from 'next/link';
import { UsersIcon, ClockIcon } from '@heroicons/react/20/solid';
import { EventFromAPI } from 'pages/api/events/list';
import CheckInButton from '@components/reusables/CheckInButton';
// import { ClockIcon } from '@heroicons/react/24/outline';

interface EventProps {
  event: EventFromAPI;
}

export default function EventItem({ event }: EventProps) {
  if (!event.startDate || !event.checkInsMaxQuantity) {
    return null;
  }

  const startDatetime = new Date(event.startDate);

  return (
    <li
      key={event.id}
      className="group flex items-center space-x-4 rounded-xl px-4 py-2 focus-within:bg-gray-100"
    >
      <img
        src={event.instructor.image || '/default-user-img.jpeg'}
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
      <CheckInButton event={event} />
    </li>
  );
}
