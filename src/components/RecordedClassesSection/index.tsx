import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ClassesSection from './ClassesSection';
import Toolbar from './Toolbar';
import useDebounce from '@hooks/useDebounce';
import { useRecordedEvents } from '@hooks/useEvents';
import { Loader2 } from 'lucide-react';
import Pagination from '@components/reusables/Pagination';

export default function RecordedClassesSection() {
  const router = useRouter();
  const [search, setSearch] = useState(() => {
    const query = router.query;
    return typeof query.search === 'string' ? query.search : '';
  });
  const [durationFilter, setDurationFilter] = useState<string[]>(() => {
    const query = router.query;
    return Array.isArray(query.duration)
      ? query.duration
      : typeof query.duration === 'string'
      ? [query.duration]
      : [];
  });
  const [intensityFilter, setIntensityFilter] = useState<string[]>(() => {
    const query = router.query;
    return Array.isArray(query.intensity)
      ? query.intensity
      : typeof query.intensity === 'string'
      ? [query.intensity]
      : [];
  });
  const [premiumFilter, setPremiumFilter] = useState<string[]>(() => {
    const query = router.query;
    return Array.isArray(query.premium)
      ? query.premium
      : typeof query.premium === 'string'
      ? [query.premium]
      : [];
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const debounceSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [search, durationFilter, intensityFilter, pageSize]);

  const { data, isLoading, isFetching } = useRecordedEvents({
    search: debounceSearch,
    duration: durationFilter,
    intensity: intensityFilter,
    premium: premiumFilter,
    page,
    pageSize,
  });

  const { events, totalPages } = data || {};

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <div className="flex items-center">
            <h2 className="text-2xl font-bold tracking-tight">
              aulas gravadas
            </h2>
            {isFetching && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </div>
          <p className="text-muted-foreground">
            procure a prática que deseja e seja feliz :)
          </p>
        </div>
      </div>
      <Toolbar
        search={debounceSearch}
        setSearch={setSearch}
        durationFilter={durationFilter}
        setDurationFilter={setDurationFilter}
        intensityFilter={intensityFilter}
        setIntensityFilter={setIntensityFilter}
        premiumFilter={premiumFilter}
        setPremiumFilter={setPremiumFilter}
      />
      <ClassesSection events={events} isLoading={isLoading} />
      <Pagination
        currentPage={page}
        pageSize={pageSize}
        totalPages={totalPages || 1}
        onChangePage={setPage}
        onChangePageSize={setPageSize}
      />
    </div>
  );
}
