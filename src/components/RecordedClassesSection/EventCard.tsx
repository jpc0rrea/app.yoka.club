import DurationBadge from '@components/reusables/DurationBadge';
import FavoriteButton from '@components/reusables/FavoriteButton';
import IntensityBadge from '@components/reusables/IntensityBadge';
import IsPremiumBadge from '@components/reusables/IsPremiumBadge';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { useUserPlan } from '@hooks/useUserPlan';
import getYouTubeThumbnailURL from '@lib/utilities/getYouTubeThumbnailURL';
import { EventFromAPI } from '@models/events/types';
import { LockIcon } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  event: EventFromAPI;
}

export default function EventCard({ event }: EventCardProps) {
  const { data: userPlan, isLoading: isUserLoading } = useUserPlan();
  const { isPremium } = event;

  if (!event || !event.recordedUrl) {
    return null;
  }

  if (!userPlan || isUserLoading) {
    return <Skeleton className="h-64 flex-1" />;
  }

  const userHaveAccess = userPlan.canSeeExclusiveContents || !isPremium;

  return (
    <Card className="px-4 py-2">
      <CardHeader className="px-0 py-4">
        <CardDescription className="flex items-center justify-between py-1">
          <div>
            <DurationBadge duration={event.duration} />
            {event.intensity && <IntensityBadge intensity={event.intensity} />}
            <IsPremiumBadge isPremium={event.isPremium} />
          </div>
          <FavoriteButton eventId={event.id} />
        </CardDescription>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {userHaveAccess ? (
                <Link href={`/events/${event.id}`}>
                  <CardTitle
                    className={`line-clamp-2 h-14 cursor-pointer overflow-hidden text-ellipsis text-left transition-all hover:underline ${
                      userHaveAccess ? '' : 'cursor-not-allowed'
                    }`}
                  >
                    {event.title}
                  </CardTitle>
                </Link>
              ) : (
                <CardTitle
                  className={`line-clamp-2 h-14 cursor-pointer overflow-hidden text-ellipsis text-left transition-all ${
                    userHaveAccess ? '' : 'cursor-not-allowed'
                  }`}
                >
                  {event.title}
                </CardTitle>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <p>{event.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="px-0">
        <div className={`relative`}>
          {!userHaveAccess && (
            <div className="absolute left-0 top-0 z-[5] h-full w-full bg-black bg-opacity-20 blur-md"></div>
          )}

          <img
            alt="Thumbnail"
            className={`w-full object-cover ${
              !userHaveAccess ? 'blur-md ' : ''
            }`}
            height="90"
            src={getYouTubeThumbnailURL(event.recordedUrl)}
            style={{
              aspectRatio: '16/9',
              objectFit: 'cover',
            }}
            width="160"
          />
          {!userHaveAccess && (
            <div className="absolute left-0 top-0 z-[15] flex h-full w-full items-center justify-center">
              <div className="text-center">
                <LockIcon className="mx-auto text-white" size={32} />
                <p className="text-sm text-white">
                  assine um plano para ter acesso a essa aula
                </p>
              </div>
            </div>
          )}
        </div>
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
        {userHaveAccess ? (
          <Button variant="default" asChild>
            <Link href={`/events/${event.id}`}>ir para aula</Link>
          </Button>
        ) : (
          <Button variant="default" className="cursor-not-allowed" disabled>
            ir para aula
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
