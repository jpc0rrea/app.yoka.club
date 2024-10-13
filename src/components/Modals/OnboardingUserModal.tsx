import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function PlayIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="11.5" stroke="#FFF" />
      <path
        d="M9.5 14.382V9.618a.5.5 0 0 1 .724-.447l4.764 2.382a.5.5 0 0 1 0 .894l-4.764 2.382a.5.5 0 0 1-.724-.447Z"
        fill="#FFF"
        stroke="#FFF"
      />
    </svg>
  );
}

export default function OnboardingUserModal() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [seeOnboardingVideo, setSeeOnboardingVideo] = useState(false);

  useEffect(() => {
    if (router.query.firstTime && router.query.firstTime === 'true') {
      setShowOnboarding(true);

      // remove the query param from the URL
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router]);

  return (
    <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
      <DialogContent className={`${seeOnboardingVideo ? 'min-w-[80%]' : ''}`}>
        <DialogHeader>
          <DialogTitle className="text-center font-medium text-gray-800">
            bem vinda a plataforma yoka club
          </DialogTitle>
        </DialogHeader>

        {seeOnboardingVideo ? (
          <div className="aspect-video h-full w-full">
            <iframe
              // width="560"
              // width="1120"
              // height="315"
              // height="630"
              src="https://www.youtube.com/embed/CPIhCaDPxuQ?si=bjuG2Q16pXIYcblE"
              title="video tutorial"
              // frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
              // allowfullscreen
            ></iframe>
          </div>
        ) : (
          <div className="flex-col">
            <p className="text-sm text-muted-foreground">
              você ganhou <strong>1 check-in para começar a praticar</strong>{' '}
              com a gente. <br />
              veja o vídeo de explicação ou explore a plataforma por sua conta
              :)
            </p>
            <div className="mt-4 flex w-full justify-center space-x-3">
              <Button
                onClick={() => setShowOnboarding(false)}
                variant="outline"
              >
                explorar plataforma
              </Button>
              <Button
                onClick={() => {
                  setSeeOnboardingVideo(true);
                }}
              >
                <PlayIcon className="h-5 w-5 flex-none" />
                <span className="ml-2">ver vídeo tutorial</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
