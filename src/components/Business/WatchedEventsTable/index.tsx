import { WatchedEvents } from '@hooks/useBusinessInformations';
import { WatchedEventsDataTable } from './data-table';
import { columns } from './columns';
import { Loader2 } from 'lucide-react';

interface WatchedEventsTableProps {
  watchedEventsTableData: WatchedEvents[] | undefined;
}

export default function WatchedEventsTable({
  watchedEventsTableData,
}: WatchedEventsTableProps) {
  return (
    <div className="py-10">
      <p className="mb-4 text-xl font-bold">Videos mais assistidos</p>
      {watchedEventsTableData ? (
        <WatchedEventsDataTable
          columns={columns}
          data={watchedEventsTableData}
        />
      ) : (
        <div>
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
}
