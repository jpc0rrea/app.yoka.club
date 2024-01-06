import { Skeleton } from '@components/ui/skeleton';
import { useNextEvents } from '@hooks/useEvents';
import EventCard from './EventCard';

export default function NextEventsSection() {
  const { data: nextEvents, isLoading: isNextEventsLoading } = useNextEvents();

  console.log(nextEvents);
  return (
    <div className="mt-6 w-full">
      <h2 className="mb-4 px-6 text-2xl font-semibold text-gray-900 dark:text-white">
        próximas aulas :)
      </h2>
      <div className="flex space-x-6 overflow-x-auto px-6 pb-6">
        {!nextEvents || isNextEventsLoading ? (
          Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="h-64 w-64 min-w-[16rem]" />
          ))
        ) : nextEvents.length === 0 ? (
          <p className="text-gray-500">não há eventos cadastrados</p>
        ) : (
          nextEvents.map((event) => (
            <div key={event.id} className="flex-none">
              <EventCard event={event} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
