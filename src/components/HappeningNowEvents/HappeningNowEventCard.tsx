import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from '@components/ui/card';
import { Button } from '@components/ui/button';
import { EventFromAPI } from '@models/events/types';
import { format, isAfter } from 'date-fns';

interface HappeningNowEventCardProps {
  event: EventFromAPI;
}

export default function HappeningNowEventCard({
  event,
}: HappeningNowEventCardProps) {
  if (!event.startDate || !event.liveUrl) {
    return null;
  }
  return (
    <Card className="relative w-full min-w-[320px] max-w-xs md:max-w-md">
      <div className="absolute right-0 top-0 flex items-center space-x-1 rounded-bl-md bg-green-500 px-2 py-1 text-xs text-white">
        {/* <span className="flex h-2 w-2 rounded-full bg-red-500" /> */}
        <span>ao vivo</span>
      </div>
      <CardHeader className="flex items-center gap-2">
        <img
          alt={event.instructor.displayName}
          className="h-12 w-12 rounded-full object-cover"
          height="50"
          src={event.instructor.imageUrl || '/default-user-img.jpeg'}
          style={{
            aspectRatio: '50/50',
            objectFit: 'cover',
          }}
          width="50"
        />
        <div className="justify-center">
          <CardTitle className="text-center">{event.title}</CardTitle>
          <CardDescription className="text-center">
            instrutora: {event.instructor.displayName}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="mb-0.5 mr-1 inline-block h-4 w-4" />
            {isAfter(new Date(event.startDate), new Date())
              ? 'começa às'
              : 'começou às'}
            : {format(new Date(event.startDate), "HH'h'mm")}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <TimerIcon className="mb-1 mr-0.5 inline-block h-4 w-4" />
            {event.duration} minutos
          </div>
        </div>
        {/* <p className="text-sm">
          Join us for a powerful Vinyasa flow that will energize your body and
          calm your mind.
        </p> */}
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="sm" asChild>
          <a href={event.liveUrl}>entrar na aula</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ClockIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TimerIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" x2="14" y1="2" y2="2" />
      <line x1="12" x2="15" y1="14" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}
