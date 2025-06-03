import { type NextPage } from 'next';
import Sidebar from '@components/Sidebar';
import { withSSREnsureWithRole } from '@server/middlewares/withSSREnsureWithRole';
import { useTrails } from '@hooks/useTrails';
import { Loader2 } from 'lucide-react';
import useUser from '@hooks/useUser';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useDebounce from '@hooks/useDebounce';
import Pagination from '@components/reusables/Pagination';
import { BottomNavBar } from '@components/bottom-nav-bar';
import CreateTrailModal from '@components/Modals/CreateTrailModal';
import TrailsSection from '@components/ManageTrailsSection/TrailsSection';
import TrailsToolbar from '@components/ManageTrailsSection/TrailsToolbar';

const TrailsManagePage: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState(() => {
    const query = router.query;
    return typeof query.search === 'string' ? query.search : '';
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const debounceSearch = useDebounce(search, 500);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const { data, isLoading, isFetching } = useTrails({
    search: debounceSearch,
    page,
    pageSize,
    enabled: !!user && user.role === 'ADMIN',
  });

  const { trails, totalPages } = data || {};

  return (
    <>
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <BottomNavBar />

          <main className="flex-1 bg-white">
            <div className="p-8 xl:p-10">
              <main className="max-w-4xl">
                <header className="flex items-center justify-between py-4 sm:py-6">
                  <div className="flex items-center">
                    <h1 className="text-base font-semibold leading-7">
                      trilhas
                    </h1>
                    {isFetching && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <CreateTrailModal />
                  </div>
                </header>

                <TrailsToolbar search={debounceSearch} setSearch={setSearch} />

                <TrailsSection trails={trails} isLoading={isLoading} />

                {!isLoading && trails && trails.length > 0 && (
                  <Pagination
                    currentPage={page}
                    pageSize={pageSize}
                    totalPages={totalPages || 1}
                    onChangePage={setPage}
                    onChangePageSize={setPageSize}
                  />
                )}
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
}, ['ADMIN']);

export default TrailsManagePage;
