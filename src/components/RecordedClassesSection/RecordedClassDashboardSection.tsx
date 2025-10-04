import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ClassesSection from './ClassesSection';
import useDebounce from '@hooks/useDebounce';
import { useRecordedEvents } from '@hooks/useEvents';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import ClassesSectionDashboard from './ClassesSectionDashboard';

export default function RecordedClassDashboardSection() {
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
  const [favoritesFilter, setFavoritesFilter] = useState<boolean>(() => {
    const query = router.query;
    return query.favorites === 'true';
  });
  const [liveFilter, setLiveFilter] = useState<boolean>(() => {
    const query = router.query;
    return query.live === 'true';
  });
  const [hasCheckedInFilter, setHasCheckedInFilter] = useState<boolean>(() => {
    const query = router.query;
    return query.hasCheckedIn === 'true';
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
    favorites: favoritesFilter,
    live: liveFilter,
    hasCheckedIn: hasCheckedInFilter,
    page,
    pageSize,
  });

  const { events, totalPages } = data || {};

  return (
    <section id="recorded-classes-section" className="bg-white py-2">
      <div className="mb-4 flex w-full items-center justify-between">
        <h2 className="text-md font-semibold text-gray-900 md:text-xl">
          aulas gravadas
        </h2>
        <Link
          href="/recorded-classes"
          className="text-sm text-brand-yoka-purple-700 hover:underline"
        >
          mostrar mais
        </Link>
      </div>

      <ClassesSectionDashboard events={events} isLoading={isLoading} />
    </section>
  );
}
