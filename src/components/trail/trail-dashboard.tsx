import { TrailsSection } from './trail-section';
import { usePublicTrails } from '@hooks/useTrails';
import { Loader2 } from 'lucide-react';

export function TrailsDashboardSection() {
  const {
    data: trailsData,
    isLoading,
    error,
  } = usePublicTrails({
    enabled: true,
    page: 1,
    pageSize: 10, // Limit to show most recent/relevant trails
  });

  // Loading state
  if (isLoading) {
    return (
      <section id="trails" aria-label="Trails" className="bg-white py-2">
        <div className="mb-4 flex w-full items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900 md:text-xl">
            trilhas
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-gray-600">
            carregando trilhas...
          </span>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="trails" aria-label="Trails" className="bg-white py-2">
        <div className="mb-4 flex w-full items-center justify-between">
          <h2 className="text-md font-semibold text-gray-900 md:text-xl">
            trilhas
          </h2>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">
            erro ao carregar trilhas. tente novamente mais tarde.
          </p>
        </div>
      </section>
    );
  }

  // Empty state
  if (!trailsData?.trails || trailsData.trails.length === 0) {
    return null;
    // return (
    //   <section id="trails" aria-label="Trails" className="bg-white py-2">
    //     <div className="mb-4 flex w-full items-center justify-between">
    //       <h2 className="text-md font-semibold text-gray-900 md:text-xl">
    //         trilhas
    //       </h2>
    //     </div>
    //     <div className="py-8 text-center">
    //       <p className="text-sm text-gray-600">
    //         nenhuma trilha disponível no momento.
    //       </p>
    //     </div>
    //   </section>
    // );
  }

  // Transform API data to match TrailsSection interface
  const trailsSectionData = {
    title: 'trilhas',
    actionLabel: 'mostrar mais',
    onActionClick: () => {
      // This will be handled by the href in the component
    },
    trails: trailsData.trails.map((trail) => ({
      id: trail.id,
      imageUrl: trail.coverImageUrl || '/images/trail-placeholder.jpg', // Fallback image
      href: `/trails/${trail.id}`,
    })),
  };

  return (
    <section id="trails" aria-label="Trails" className="bg-white py-2">
      {/* <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="text-3xl font-medium tracking-tight text-brand-yoka-purple-800 sm:text-4xl">
            conheça nossas trilhas
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            cada trilha é uma jornada para o seu corpo e mente
          </p>
        </div> */}
      <TrailsSection {...trailsSectionData} />
    </section>
  );
}
