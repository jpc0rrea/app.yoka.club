import { CalendarIcon, ClockIcon } from '@heroicons/react/20/solid';
import { type NextPage } from 'next';
import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { Loader2, Play, Lock } from 'lucide-react';
import { useState } from 'react';
import useUser from '@hooks/useUser';
import { BottomNavBar } from '@components/bottom-nav-bar';
import { usePublicTrailById } from '@hooks/useTrails';
import { TrailEventFromAPI } from '@models/trails/types';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import IsPremiumBadge from '@components/reusables/IsPremiumBadge';
import { useUserPlan } from '@hooks/useUserPlan';
import UserCantAccessPremiumSystemResourceAlert from '@components/Modals/UserCantAccessPremiumSystemResourceAlert';

const Trail: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const trailId = router.query.trailId as string;
  const selectedEventId = router.query.eventId as string;
  const { data: userPlan, isLoading: isUserPlanLoading } = useUserPlan();

  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');

  const { data: trail, isLoading } = usePublicTrailById({ trailId });

  // Helper function to check if user can access premium content
  const canUserAccessEvent = (event: any) => {
    if (!event.isPremium) return true; // Free content is always accessible
    if (!userPlan) return false;
    return userPlan.canSeeExclusiveContents;
  };

  if (isLoading || !trail || isUserPlanLoading) {
    return (
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col pb-20 md:pb-0 md:pl-64">
          <BottomNavBar />
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  // Get the current selected event or default to the first one
  const currentEvent = selectedEventId
    ? trail.trailEvents.find((te) => te.event.id === selectedEventId)?.event
    : trail.trailEvents[0]?.event;

  if (!currentEvent) {
    return (
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col pb-20 md:pb-0 md:pl-64">
          <BottomNavBar />
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">
              Esta trilha não possui aulas disponíveis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleEventSelect = (eventId: string) => {
    router.push(`/trails/${trailId}?eventId=${eventId}`, undefined, {
      shallow: true,
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';

    // Extract video ID from various YouTube URL formats
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2] && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url;
  };

  const getIntensityBadge = (intensity: string | null) => {
    if (!intensity) return null;

    const intensityConfig = {
      LIGHT: { label: 'Leve', className: 'bg-green-100 text-green-800' },
      MODERATE: {
        label: 'Moderado',
        className: 'bg-yellow-100 text-yellow-800',
      },
      INTENSE: { label: 'Intenso', className: 'bg-red-100 text-red-800' },
    };

    const config = intensityConfig[intensity as keyof typeof intensityConfig];
    if (!config) return null;

    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Check if user can access the current event
  const canAccessCurrentEvent = canUserAccessEvent(currentEvent);

  return (
    <div>
      <Sidebar />
      <div className="flex flex-1 flex-col pb-20 md:pb-0 md:pl-64">
        <BottomNavBar />

        <main className="flex-1 bg-white">
          {/* Mobile Layout - Stacked */}
          <div className="block lg:hidden">
            {/* Main Section - Mobile */}
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="space-y-4">
                {/* Current Event Info */}
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-purple-800">
                    {currentEvent.title}
                  </h2>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getIntensityBadge(currentEvent.intensity)}
                    <IsPremiumBadge isPremium={currentEvent.isPremium} />
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <ClockIcon className="h-3 w-3" />
                      {currentEvent.duration} min
                    </Badge>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center space-x-2">
                    <img
                      className="h-6 w-6 rounded-full"
                      src={
                        currentEvent.instructor.imageUrl ||
                        '/default-user-img.jpeg'
                      }
                      alt={currentEvent.instructor.displayName}
                    />
                    <span className="text-sm text-gray-600">
                      {currentEvent.instructor.displayName}
                    </span>
                  </div>
                </div>

                {/* Video Player */}
                {currentEvent.recordedUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                    {canAccessCurrentEvent ? (
                      <iframe
                        src={getYouTubeEmbedUrl(currentEvent.recordedUrl)}
                        className="h-full w-full"
                        allowFullScreen
                        title={currentEvent.title}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <UserCantAccessPremiumSystemResourceAlert
                          triggerButton={
                            <div className="flex cursor-pointer flex-col items-center text-gray-600">
                              <Lock className="mb-2 h-12 w-12" />
                              <p className="text-sm font-medium">
                                Conteúdo Premium
                              </p>
                              <p className="text-xs">Clique para assinar</p>
                            </div>
                          }
                          title="você não tem permissão para ver essa aula :("
                          description="somente assinantes têm acesso às aulas exclusivas"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* List Section - Mobile */}
            <div className="bg-gray-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-purple-800">
                aulas da trilha ({trail.trailEvents.length})
              </h3>
              <div className="space-y-2">
                {trail.trailEvents.map((trailEvent, index) => {
                  const canAccessEvent = canUserAccessEvent(trailEvent.event);
                  return (
                    <button
                      key={trailEvent.event.id}
                      onClick={() => {
                        if (canAccessEvent) {
                          handleEventSelect(trailEvent.event.id);
                        }
                      }}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        currentEvent.id === trailEvent.event.id
                          ? 'border-purple-200 bg-purple-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      } ${!canAccessEvent ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {trailEvent.event.title}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <span>{trailEvent.event.duration} min</span>
                            {trailEvent.event.isPremium && (
                              <Lock className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                        {canAccessEvent && trailEvent.event.recordedUrl && (
                          <Play className="h-4 w-4 text-purple-600" />
                        )}
                        {!canAccessEvent && trailEvent.event.isPremium && (
                          <UserCantAccessPremiumSystemResourceAlert
                            triggerButton={
                              <Lock className="h-4 w-4 cursor-pointer text-gray-400 hover:text-purple-600" />
                            }
                            title="você não tem permissão para ver essa aula :("
                            description="somente assinantes têm acesso às aulas exclusivas"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Two Columns */}
          <div className="hidden lg:flex lg:h-screen lg:overflow-hidden">
            {/* Main Section - Desktop */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="mx-auto max-w-4xl space-y-6">
                  {/* Current Event Info */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-purple-800">
                      {currentEvent.title}
                    </h2>

                    {/* Badges */}
                    <div className="flex items-center gap-3">
                      {getIntensityBadge(currentEvent.intensity)}
                      <IsPremiumBadge isPremium={currentEvent.isPremium} />
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <ClockIcon className="h-4 w-4" />
                        {currentEvent.duration} min
                      </Badge>
                    </div>

                    {/* Instructor */}
                    <div className="flex items-center space-x-3">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={
                          currentEvent.instructor.imageUrl ||
                          '/default-user-img.jpeg'
                        }
                        alt={currentEvent.instructor.displayName}
                      />
                      <span className="text-gray-600">
                        {currentEvent.instructor.displayName}
                      </span>
                    </div>
                  </div>

                  {/* Video Player */}
                  {currentEvent.recordedUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 shadow-lg">
                      {canAccessCurrentEvent ? (
                        <iframe
                          src={getYouTubeEmbedUrl(currentEvent.recordedUrl)}
                          className="h-full w-full"
                          allowFullScreen
                          title={currentEvent.title}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                          <UserCantAccessPremiumSystemResourceAlert
                            triggerButton={
                              <div className="flex cursor-pointer flex-col items-center text-gray-600 transition-colors hover:text-purple-600">
                                <Lock className="mb-4 h-16 w-16" />
                                <p className="text-lg font-medium">
                                  conteúdo premium
                                </p>
                                <p className="text-sm">
                                  clique aqui para assinar e ter acesso
                                </p>
                              </div>
                            }
                            title="você não tem permissão para ver essa aula :("
                            description="somente assinantes têm acesso às aulas exclusivas"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* List Section - Desktop */}
            <div className="w-80 overflow-y-auto border-l border-gray-200 bg-gray-50">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-purple-800">
                  aulas da trilha ({trail.trailEvents.length})
                </h3>
                <div className="space-y-3">
                  {trail.trailEvents.map((trailEvent, index) => {
                    const canAccessEvent = canUserAccessEvent(trailEvent.event);
                    return (
                      <button
                        key={trailEvent.event.id}
                        onClick={() => {
                          if (canAccessEvent) {
                            handleEventSelect(trailEvent.event.id);
                          }
                        }}
                        className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
                          currentEvent.id === trailEvent.event.id
                            ? 'border-purple-200 bg-purple-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm'
                        } ${!canAccessEvent ? 'opacity-75' : ''}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <span className="overflow-hidden text-sm font-medium text-gray-900">
                                  {trailEvent.event.title}
                                </span>
                              </div>
                            </div>
                            {canAccessEvent && trailEvent.event.recordedUrl && (
                              <Play className="h-4 w-4 flex-shrink-0 text-purple-600" />
                            )}
                            {!canAccessEvent && trailEvent.event.isPremium && (
                              <UserCantAccessPremiumSystemResourceAlert
                                triggerButton={
                                  <Lock className="h-4 w-4 flex-shrink-0 cursor-pointer text-gray-400 hover:text-purple-600" />
                                }
                                title="você não tem permissão para ver essa aula :("
                                description="somente assinantes têm acesso às aulas exclusivas"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{trailEvent.event.duration} min</span>
                            {trailEvent.event.isPremium && (
                              <Lock className="h-3 w-3" />
                            )}
                            {trailEvent.event.intensity && (
                              <span className="capitalize">
                                {trailEvent.event.intensity.toLowerCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const getServerSideProps = withSSREnsureSubscribed(async () => {
  return {
    props: {},
  };
});

export default Trail;
