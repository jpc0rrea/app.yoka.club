// import { format } from 'date-fns';
import Link from 'next/link';
// import { UsersIcon, ClockIcon } from '@heroicons/react/20/solid';
import { Event } from '@prisma/client';
// import { ClockIcon } from '@heroicons/react/24/outline';

interface EventProps {
  event: Event;
}

export default function EventItem({ event }: EventProps) {
  return (
    <li
      key={event.id}
      className="group flex items-center space-x-4 rounded-xl px-4 py-2 focus-within:bg-gray-100"
    >
      {/* <img
        src={event.instructor.imageUrl || '/default-user-img.jpeg'}
        alt=""
        className="h-10 w-10 flex-none rounded-full"
      /> */}
      <div className="max-w-full flex-auto">
        <Link
          href={`/events/${event.id}`}
          className="max-w-full break-words text-sm font-medium text-brand-purple-900 hover:text-brand-purple-800 hover:underline"
        >
          {event.title}
        </Link>
        {/* {event.checkInsMaxQuantity && (
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
        )} */}
      </div>
    </li>
  );
}
