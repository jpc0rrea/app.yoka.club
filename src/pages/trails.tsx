import Header from '@components/Header';
import { type NextPage } from 'next';
import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import { BottomNavBar } from '@components/bottom-nav-bar';
import { usePublicTrails } from '@hooks/useTrails';
import { TrailCard } from '@components/trail';
import { Loader2 } from 'lucide-react';

const TrailsPage: NextPage = () => {
  const {
    data: trailsData,
    isLoading,
    error,
  } = usePublicTrails({
    enabled: true,
    page: 1,
    pageSize: 50, // Get more trails for the listing page
  });

  return (
    <>
      <div className="flex h-screen flex-col overflow-y-auto">
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <main className="flex-1 bg-white pb-20 md:pb-0">
            <div className=" max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="mb-4">
                <div className="flex flex-col items-start">
                  {/* <h2 className="text-2xl font-bold tracking-tight">
              aulas gravadas
            </h2> */}
                  <h2 className="text-md font-semibold text-gray-900 md:text-xl">
                    conheça nossas trilhas :)
                  </h2>
                  <p className="md:text-md mt-2 text-sm text-gray-600">
                    descubra jornadas completas para transformar sua prática
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">
                    carregando trilhas...
                  </span>
                </div>
              )}

              {/* Error State */}
              {!!error && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-red-800">
                    erro ao carregar trilhas. tente novamente mais tarde.
                  </p>
                </div>
              )}

              {/* Trails List */}
              {trailsData?.trails && trailsData.trails.length > 0 && (
                <div className="space-y-6">
                  {trailsData.trails.map((trail) => (
                    <TrailCard key={trail.id} trail={trail} />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {trailsData?.trails && trailsData.trails.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-600">
                    nenhuma trilha encontrada no momento.
                  </p>
                </div>
              )}
            </div>
            <BottomNavBar />
          </main>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = withSSREnsureSubscribed(async () => {
  return {
    props: {},
  };
});

export default TrailsPage;
