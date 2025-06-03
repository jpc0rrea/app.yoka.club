import { BottomNavBar } from '@components/bottom-nav-bar';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';
import { useUserProfile } from '@hooks/useUsers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';

export default function User() {
  const router = useRouter();

  // get the username from the url
  const { username } = router.query;

  const { data: user, isLoading } = useUserProfile({
    username: (username as string)?.split('@')[1] || '',
  });

  return (
    <>
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <BottomNavBar />

          <main className="flex-1 bg-white">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {isLoading || !user ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="">
                    <div className="flex items-start space-x-5">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            className="h-16 w-16 rounded-full"
                            src={user.imageUrl || '/images/default-avatar.png'}
                            alt={user.displayName}
                          />
                          <span
                            className="absolute inset-0 rounded-full shadow-inner"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      {/*
          Use vertical padding to simulate center alignment when both lines of text are one line,
          but preserve the same layout if the text wraps without making the image jump around.
        */}
                      <div className="">
                        <h1 className="text-2xl font-bold text-purple-800">
                          {user.displayName}
                        </h1>
                        <p className="text-sm font-medium text-gray-500">
                          @{user.username} | membro desde{' '}
                          {format(
                            new Date(user.createdAt),
                            "dd 'de' MMMM 'de' yyyy",
                            {
                              locale: ptBR,
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-sm leading-snug text-gray-500">
                      <p className="text-xl font-bold text-purple-800">
                        sobre {user.displayName}
                      </p>
                      {user.bio ? (
                        user.bio.split('\n').map((line, index) => {
                          return (
                            <span key={index}>
                              {line}
                              <br />
                            </span>
                          );
                        })
                      ) : (
                        <p className="text-gray-600">
                          {user.displayName} ainda não escreveu sua bio.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
