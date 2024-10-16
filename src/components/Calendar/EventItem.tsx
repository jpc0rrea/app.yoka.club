import { format } from 'date-fns';
import Link from 'next/link';
import { UsersIcon, ClockIcon } from '@heroicons/react/20/solid';
import CheckInButton from '@components/reusables/CheckInButton';
import { EventFromAPI } from '@models/events/types';
import { Card, CardContent } from '@components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@components/ui/avatar';

interface EventProps {
  event: EventFromAPI;
}

export default function EventItem({ event }: EventProps) {
  if (!event.startDate) {
    return null;
  }

  const startDatetime = new Date(event.startDate);

  return (
    <Card key={event.id}>
      <CardContent className="p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-grow items-center gap-3">
            <Avatar>
              <AvatarImage
                src={event.instructor.imageUrl || '/default-user-img.jpeg'}
                alt={`${event.instructor.displayName}'s profile`}
              />
              <AvatarFallback>
                {event.instructor.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-md font-poppins font-medium leading-tight text-brand-yoka-purple-700 hover:underline">
                <Link href={`/events/${event.id}`}>{event.title}</Link>
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                <ClockIcon
                  className="mr-1.5 inline-block h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <strong>{format(startDatetime, "HH'h'mm")}</strong> -{' '}
                {event.duration} minutos
              </p>
              {event.checkInsMaxQuantity && (
                <p className="mt-1 text-xs text-gray-500">
                  <UsersIcon
                    className="mr-1.5 inline-block h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>
                      {event.checkIns.length}/{event.checkInsMaxQuantity}
                    </strong>{' '}
                    participantes
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <CheckInButton event={event} />
            {/* <Button
              onClick={() => handleGoToClass(event.id)}
              className="w-full sm:w-auto"
            >
              Go to Class
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
