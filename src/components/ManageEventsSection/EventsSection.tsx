import { EventFromAPI } from '@models/events/types';
import { Loader2 } from 'lucide-react';
import EventInManageSection from './EventInManageSection';
import useUser from '@hooks/useUser';

interface ClassesSectionProps {
  events?: EventFromAPI[];
  isLoading: boolean;
}

export default function EventsSection({
  events,
  isLoading,
}: ClassesSectionProps) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  if (user.role === 'USER') {
    return null;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {!events || isLoading ? (
        <Loader2 className="mr-2 mt-4 h-4 w-4 animate-spin" />
      ) : events.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          nenhum evento encontrado{' '}
          {user.role === 'INSTRUCTOR' ? 'em que você foi instrutor' : ''}
        </p>
      ) : (
        events.map((event) => {
          return <EventInManageSection key={event.id} event={event} />;
        })
      )}
    </ul>
  );
}
