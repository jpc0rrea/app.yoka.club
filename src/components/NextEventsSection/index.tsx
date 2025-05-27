import { Skeleton } from '@components/ui/skeleton';
import { useNextEvents } from '@hooks/useEvents';
import EventCard from './EventCard';

export default function NextEventsSection() {
  const { data: nextEvents, isLoading: isNextEventsLoading } = useNextEvents();

  return (
    <section className="bg-white py-2">
      <div className="mb-4 flex w-full items-center justify-between px-4 md:px-8">
        <h2 className="text-md font-semibold text-gray-900 md:text-xl">
          próximas aulas ao vivo :)
        </h2>
        <a
          className="text-sm text-brand-yoka-purple-700 hover:underline"
          href="#next-events-section"
        >
          mostrar mais
        </a>
      </div>

      <div className="relative mt-4">
        <div className="scrollbar-hide flex gap-4 overflow-x-auto overflow-y-hidden px-4 md:px-8">
          {!nextEvents || isNextEventsLoading ? (
            Array.from({ length: 10 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-64 w-64 min-w-[16rem] flex-shrink-0"
              />
            ))
          ) : nextEvents.length === 0 ? (
            <p className="text-sm text-gray-500 md:text-base">
              não há eventos cadastrados
            </p>
          ) : (
            nextEvents.map((event) => (
              <div key={event.id} className="flex-shrink-0">
                <EventCard event={event} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
