import Header from '@components/Header';
import { type NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@components/Sidebar';
import { withSSREnsureWithRole } from '@server/middlewares/withSSREnsureWithRole';
import CreateEventModal from '@components/Modals/CreateEventModal';
import { useEventsToManage } from '@hooks/useEvents';
import { Loader2 } from 'lucide-react';
import useUser from '@hooks/useUser';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useDebounce from '@hooks/useDebounce';
import Pagination from '@components/reusables/Pagination';
import EventsSection from '@components/ManageEventsSection/EventsSection';
import Toolbar from '@components/ManageEventsSection/Toolbar';

const Event: NextPage = () => {
  const { user } = useUser();
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
  const [isLiveFilter, setIsLiveFilter] = useState<string[]>(() => {
    const query = router.query;
    return Array.isArray(query.isLive)
      ? query.isLive
      : typeof query.isLive === 'string'
      ? [query.isLive]
      : [];
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const debounceSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [search, durationFilter, intensityFilter, pageSize]);
  const { data, isLoading, isFetching } = useEventsToManage({
    search: debounceSearch,
    duration: durationFilter,
    intensity: intensityFilter,
    premium: premiumFilter,
    isLive: isLiveFilter,
    page,
    pageSize,
    enabled: !!user && user.role === 'ADMIN',
  });

  const { events, totalPages } = data || {};

  return (
    <>
      <Head>
        <title>plataforma yoga com kaká</title>
      </Head>

      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <Header />

          <main className="flex-1 bg-white">
            <div className="p-8 xl:p-10">
              <main className="max-w-4xl">
                <header className="flex items-center justify-between py-4 sm:py-6">
                  <div className="flex items-center">
                    <h1 className="text-base font-semibold leading-7">
                      eventos
                    </h1>
                    {isFetching && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center space-x-1">
                    <CreateEventModal />
                  </div>
                </header>

                <Toolbar
                  search={debounceSearch}
                  setSearch={setSearch}
                  durationFilter={durationFilter}
                  setDurationFilter={setDurationFilter}
                  intensityFilter={intensityFilter}
                  setIntensityFilter={setIntensityFilter}
                  premiumFilter={premiumFilter}
                  setPremiumFilter={setPremiumFilter}
                  isLiveFilter={isLiveFilter}
                  setIsLiveFilter={setIsLiveFilter}
                />
                <EventsSection events={events} isLoading={isLoading} />
                <Pagination
                  currentPage={page}
                  pageSize={pageSize}
                  totalPages={totalPages || 1}
                  onChangePage={setPage}
                  onChangePageSize={setPageSize}
                />
              </main>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = withSSREnsureWithRole(async () => {
  return {
    props: {},
  };
}, ['ADMIN', 'INSTRUCTOR']);

export default Event;
