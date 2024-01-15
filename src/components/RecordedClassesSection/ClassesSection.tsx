import { Skeleton } from '@components/ui/skeleton';
import { EventFromAPI } from '@models/events/types';
import EventCard from './EventCard';

interface ClassesSectionProps {
  events?: EventFromAPI[];
  isLoading: boolean;
}

export default function ClassesSection({
  events,
  isLoading,
}: ClassesSectionProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {isLoading || !events ? (
        Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-64 flex-1" />
        ))
      ) : events.length === 0 ? (
        <p>Nenhum evento foi encontrado com esses filtros :(</p>
      ) : (
        events.map((event) => {
          return (
            <div key={event.id} className="flex-none">
              <EventCard event={event} />
            </div>
          );
        })
      )}
    </div>
  );
}
