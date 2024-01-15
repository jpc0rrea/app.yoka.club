import IntensityBadge from '@components/reusables/IntensityBadge';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import getYouTubeThumbnailURL from '@lib/utilities/getYouTubeThumbnailURL';
import { EventFromAPI } from '@models/events/types';
import Link from 'next/link';

interface EventCardProps {
  event: EventFromAPI;
}

export default function EventCard({ event }: EventCardProps) {
  if (!event || !event.recordedUrl) {
    return null;
  }

  return (
    <Card className="px-4 py-2">
      <CardHeader className="px-0 py-4">
        <CardDescription className="py-1">
          <Badge
            variant="secondary"
            className="min-w-max rounded-sm px-1 font-normal"
          >
            {event.duration} minutos
          </Badge>
          {event.intensity && <IntensityBadge intensity={event.intensity} />}
        </CardDescription>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Link href={`/events/${event.id}`}>
                <CardTitle className="line-clamp-2 h-12 cursor-pointer overflow-hidden text-ellipsis text-left transition-all hover:underline">
                  {event.title}
                </CardTitle>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{event.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-0">
        <img
          alt="Thumbnail"
          className="w-full object-cover"
          height="90"
          src={getYouTubeThumbnailURL(event.recordedUrl)}
          style={{
            aspectRatio: '16/9',
            objectFit: 'cover',
          }}
          width="160"
        />
        <div className="mt-2">
          {/* <p className="text-xs text-gray-500">
            A beginner-friendly yoga lesson to help you get started on your yoga
            journey.
          </p> */}
          <p className="mt-1 text-xs text-gray-500">
            instrutora: {event.instructor.displayName}
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-0">
        <Button variant="default">ir para aula</Button>
      </CardFooter>
    </Card>
  );
}
