import { EventFromAPI } from '@models/events/types';
import { Loader2 } from 'lucide-react';
import EventInManageSection from './EventInManageSection';

interface ClassesSectionProps {
  events?: EventFromAPI[];
  isLoading: boolean;
}

export default function EventsSection({
  events,
  isLoading,
}: ClassesSectionProps) {
  return (
    <ul className="divide-y divide-gray-100">
      {!events || isLoading ? (
        <Loader2 className="mr-2 mt-4 h-4 w-4 animate-spin" />
      ) : events.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">nenhum evento encontrado</p>
      ) : (
        events.map((event) => {
          return <EventInManageSection key={event.id} event={event} />;
        })
      )}
    </ul>
  );
}
