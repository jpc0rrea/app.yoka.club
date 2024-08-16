import { WatchedEvents } from '@hooks/useBusinessInformations';
import { DataTable } from './data-table';
import { columns } from './columns';

interface WatchedVideosTableProps {
  watchedVideos: WatchedEvents[];
}

export default function WatchedVideosTable({
  watchedVideos,
}: WatchedVideosTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={watchedVideos} />
    </div>
  );
}
