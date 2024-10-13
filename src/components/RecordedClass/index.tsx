import { EventFromAPI } from '@models/events/types';
import IntensityBadge from '@components/reusables/IntensityBadge';
import DurationBadge from '@components/reusables/DurationBadge';
import IsPremiumBadge from '@components/reusables/IsPremiumBadge';
import { useUserPlan } from '@hooks/useUserPlan';
import { Loader2 } from 'lucide-react';
import { LockIcon } from 'lucide-react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { api } from '@lib/api';
import { useCallback, useState } from 'react';
import { WatchSession } from '@prisma/client';
// import RecomendedVideos from './RecomendedVideos';

interface RecordedClassProps {
  event: EventFromAPI;
}

// TODO: quando adicionar a seção aulas gravadas, trocar llg por lg
// e trocar de ordem o instrutor com o video

export default function RecordedClass({ event }: RecordedClassProps) {
  const { data: userPlan, isLoading: isUserLoading } = useUserPlan();
  const [watchSessionId, setWatchSessionId] = useState<string | undefined>(
    undefined
  );
  const { isPremium } = event;

  const onProgress = useCallback(
    async (state: OnProgressProps) => {
      try {
        await api.post('watch-session/progress', {
          watchSessionId,
          progress: Number(state.played.toFixed(2)),
          playedSeconds: state.playedSeconds,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [watchSessionId]
  );

  if (!event || !event.recordedUrl) {
    return null;
  }

  if (!userPlan || isUserLoading) {
    return <Loader2 className="m-8 h-8 w-8" />;
  }

  async function onStart() {
    const watchSessionResponse = await api.get<{
      watchSession: WatchSession;
    }>(`watch-session?eventId=${event.id}`);

    setWatchSessionId(watchSessionResponse.data.watchSession.id);
  }

  const userHaveAccess = userPlan.canSeeExclusiveContents || !isPremium;
  return (
    <div className="p-4 lg:p-8">
      <div className="llg:grid-cols-3 grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                alt={event.instructor.displayName}
                className="aspect-square rounded-full object-cover"
                height={40}
                src={event.instructor.imageUrl || '/images/default-avatar.png'}
                width={40}
              />
              <div className="text-sm">
                <div className="font-semibold">
                  {event.instructor.displayName}
                </div>
                {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                  pensar em algo
                </div> */}
              </div>
            </div>
            {/* <div className="ml-auto">
              <Button variant="outline">Subscribe</Button>
            </div> */}
          </div>
          <div className="flex flex-wrap gap-2">
            {event.intensity && <IntensityBadge intensity={event.intensity} />}
            <DurationBadge duration={event.duration} />
            <IsPremiumBadge isPremium={event.isPremium} />
          </div>
          {/* <RecomendedVideos /> */}
        </div>
        <div className="llg:col-span-2">
          <div className="overflow-hidden rounded-xl">
            <span className="aspect-video w-full rounded-md bg-muted" />
          </div>
          <div className="grid gap-2 py-2">
            <h1 className="line-clamp-2 text-xl font-semibold text-brand-yoka-purple-700">
              {event.title}
            </h1>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">
              Today, we're introducing the frontend cloud, where frontend
              developers build, test, and deploy high-quality web applications
              efficiently and quickly, all on Vercel.
            </p> */}
            <div className={`relative`}>
              {!userHaveAccess && (
                <div className="absolute left-0 top-0 z-[5] h-full w-full bg-black bg-opacity-20 blur-md"></div>
              )}
              {event.recordedUrl && (
                // <iframe
                //   title={event.title}
                //   allowFullScreen
                //   className={`mt-4 aspect-video w-full rounded-lg object-cover ${
                //     !userHaveAccess ? 'blur-md ' : ''
                //   }`}
                //   src={getYouTubeEmbedUrl(event.recordedUrl)}
                // ></iframe>
                <div
                  className={`mt-4 aspect-video w-full rounded-lg object-cover ${
                    !userHaveAccess ? 'blur-md ' : ''
                  }`}
                >
                  <ReactPlayer
                    url={event.recordedUrl}
                    controls
                    height="100%"
                    width="100%"
                    onProgress={onProgress}
                    progressInterval={10000}
                    onStart={onStart}
                  />
                </div>
              )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
