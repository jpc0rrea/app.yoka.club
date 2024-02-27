import { useHappeningNowEvents } from '@hooks/useEvents';
import HappeningNowEventCard from './HappeningNowEventCard';

export default function HappeningNowEvents() {
  const { data: happeningNowEvents, isLoading: isHappeningNowEventsLoading } =
    useHappeningNowEvents();

  if (
    !happeningNowEvents ||
    isHappeningNowEventsLoading ||
    happeningNowEvents.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-6 w-full">
      <h2 className="mb-4 px-6 text-2xl font-semibold text-gray-900 dark:text-white">
        acontecendo agora
      </h2>
      <div className="flex space-x-6 overflow-x-auto px-6 pb-6">
        {happeningNowEvents.map((event) => (
          <div key={event.id} className="flex-none">
            <HappeningNowEventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
