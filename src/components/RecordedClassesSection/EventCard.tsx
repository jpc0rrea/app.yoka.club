import UserCantAccessPremiumSystemResourceAlert from '@components/Modals/UserCantAccessPremiumSystemResourceAlert';
import CheckedInBadge from '@components/reusables/CheckedInBadge';
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
import useUser from '@hooks/useUser';
import { useUserPlan } from '@hooks/useUserPlan';
import getYouTubeThumbnailURL from '@lib/utilities/getYouTubeThumbnailURL';
import { EventFromAPI } from '@models/events/types';
import { hasUserAlreadyCheckedIn } from '@models/events/utils';
import Link from 'next/link';

interface EventCardProps {
  event: EventFromAPI;
}

export default function EventCard({ event }: EventCardProps) {
  const { data: userPlan, isLoading: isUserLoading } = useUserPlan();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { isPremium, isLive } = event;

  if (!event || !event.recordedUrl) {
    return null;
  }

  const hasCheckedIn = isLive
    ? hasUserAlreadyCheckedIn({
        event,
        userId: user.id,
      })
    : false;

  if (!userPlan || isUserLoading) {
    return <Skeleton className="h-64 flex-1" />;
  }

  const userHaveAccess =
    userPlan.canSeeExclusiveContents || !isPremium || hasCheckedIn;

  return (
    <Card className="px-4 py-2">
      <CardHeader className="px-0 py-4">
        <CardDescription className="flex items-center justify-between py-1">
          <div className="flex flex-wrap gap-2">
            <DurationBadge duration={event.duration} />
            {event.intensity && <IntensityBadge intensity={event.intensity} />}
            {isLive ? (
              <CheckedInBadge hasCheckedIn={hasCheckedIn} />
            ) : (
              <IsPremiumBadge isPremium={event.isPremium} />
            )}
          </div>
          <FavoriteButton eventId={event.id} />
        </CardDescription>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {userHaveAccess ? (
                <Link href={`/events/${event.id}`}>
                  <CardTitle className="line-clamp-2 h-14 cursor-pointer overflow-hidden text-ellipsis text-left font-poppins text-xl transition-all hover:underline">
                    {event.title}
                  </CardTitle>
                </Link>
              ) : (
                <UserCantAccessPremiumSystemResourceAlert
                  triggerButton={
                    <CardTitle
                      className={`line-clamp-2 h-14 cursor-pointer overflow-hidden text-ellipsis text-left transition-all`}
                    >
                      {event.title}
                    </CardTitle>
                  }
                  title="você não tem permissão para ver essa aula :("
                  description="somente assinantes tem acesso às aulas exclusivas"
                />
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
          {userHaveAccess ? (
            <Link href={`/events/${event.id}`}>
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
            </Link>
          ) : (
            <UserCantAccessPremiumSystemResourceAlert
              triggerButton={
                <img
                  alt="Thumbnail"
                  className="w-full object-cover hover:cursor-pointer"
                  height="90"
                  src={getYouTubeThumbnailURL(event.recordedUrl)}
                  style={{
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                  }}
                  width="160"
                />
              }
              title="você não tem permissão para ver essa aula :("
              description="somente assinantes tem acesso às aulas exclusivas"
            />
          )}
        </div>
        <div className="mt-2">
          {/* <p className="text-xs text-gray-500">
            A beginner-friendly yoga lesson to help you get started on your yoga
            journey.
          </p> */}
          {/* <p className="mt-1 text-xs text-gray-500">
            instrutora: {event.instructor.displayName}
          </p> */}
          {/* {isLive && event.startDate ? (
            <p className="mt-1 text-xs text-gray-500">
              aula em:{' '}
              {format(new Date(event.startDate), "dd/MM/yyyy' às 'HH:mm")}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              aula gravada em: {format(new Date(event.createdAt), 'dd/MM/yyyy')}
            </p>
          )} */}
        </div>
      </CardContent>
      <CardFooter className="px-0">
        {userHaveAccess ? (
          <Button asChild>
            <Link href={`/events/${event.id}`}>ir para aula</Link>
          </Button>
        ) : (
          <UserCantAccessPremiumSystemResourceAlert
            triggerButton={<Button variant="default">ir para aula</Button>}
            title="você não tem permissão para ver essa aula :("
            description="somente assinantes tem acesso às aulas exclusivas"
          />
        )}
      </CardFooter>
    </Card>
  );
}
