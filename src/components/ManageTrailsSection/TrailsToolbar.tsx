import { Input } from '@components/ui/input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface TrailsToolbarProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function TrailsToolbar({
  search,
  setSearch,
}: TrailsToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <Input
          type="text"
          placeholder="buscar trilhas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          error={undefined}
        />
      </div>
    </div>
  );
}
