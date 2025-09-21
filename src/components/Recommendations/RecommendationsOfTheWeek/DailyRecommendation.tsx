import UserCantAccessPremiumSystemResourceAlert from '@components/Modals/UserCantAccessPremiumSystemResourceAlert';
import DurationBadge from '@components/reusables/DurationBadge';
// import IsPremiumBadge from '@components/reusables/IsPremiumBadge';
import { Skeleton } from '@components/ui/skeleton';
import { useUserPlan } from '@hooks/useUserPlan';
import getRelativeDateString from '@lib/utilities/getRelativeDateString';
import getYouTubeThumbnailURL from '@lib/utilities/getYouTubeThumbnailURL';
import { Event } from '@prisma/client';
import { cn } from '@utils';
import Image from 'next/image';
import Link from 'next/link';

interface DailyRecommendationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  event: Event;
  recommendationDate: Date;
  aspectRatio?: 'youtube' | 'square';
  width?: number;
  height?: number;
}

export default function DailyRecommendation({
  event,
  recommendationDate,
  className,
  width = 150,
  height = 150,
  aspectRatio = 'square',
  ...props
}: DailyRecommendationProps) {
  const { data: userPlan, isLoading: isUserLoading } = useUserPlan();

  if (!userPlan || isUserLoading) {
    return <Skeleton className="h-64 flex-1" />;
  }

  const { isPremium } = event;

  const userHaveAccess = userPlan.canSeeExclusiveContents || !isPremium;

  if (!event || !event.recordedUrl) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          <DurationBadge duration={event.duration} style="simple" />
          {/* <IsPremiumBadge isPremium={event.isPremium} style="simple" /> */}
        </div>
        <div className="overflow-hidden rounded-md">
          {userHaveAccess ? (
            <Link href={`/events/${event.id}`}>
              <Image
                src={getYouTubeThumbnailURL(event.recordedUrl)}
                alt={event.title}
                width={width}
                height={height}
                className={cn(
                  'h-auto w-auto object-cover transition-all hover:scale-105',
                  aspectRatio === 'youtube' ? 'aspect-[16/9]' : 'aspect-square'
                )}
              />
            </Link>
          ) : (
            <UserCantAccessPremiumSystemResourceAlert
              triggerButton={
                <Image
                  src={getYouTubeThumbnailURL(event.recordedUrl)}
                  alt={event.title}
                  width={width}
                  height={height}
                  className={cn(
                    'h-auto w-auto object-cover transition-all hover:scale-105 hover:cursor-pointer',
                    aspectRatio === 'youtube'
                      ? 'aspect-[16/9]'
                      : 'aspect-square'
                  )}
                />
              }
              title="você não tem permissão para ver essa aula :("
              description="somente assinantes tem acesso às aulas exclusivas"
            />
          )}
        </div>
      </div>
      <div className="space-y-1 text-sm">
        {userHaveAccess ? (
          <Link href={`/events/${event.id}`}>
            <h3 className="font-poppins font-medium leading-none hover:underline">
              {event.title}
            </h3>
          </Link>
        ) : (
          <UserCantAccessPremiumSystemResourceAlert
            triggerButton={
              <h3 className="font-poppins font-medium leading-none hover:cursor-pointer hover:underline">
                {event.title}
              </h3>
            }
            title="você não tem permissão para ver essa aula :("
            description="somente assinantes tem acesso às aulas exclusivas"
          />
        )}
        <p className="text-xs text-muted-foreground">
          {getRelativeDateString(new Date(recommendationDate))}
        </p>
      </div>
    </div>
  );
}
