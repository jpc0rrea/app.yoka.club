import Header from '@components/Header';
import { type NextPage } from 'next';
import Sidebar from '@components/Sidebar';
import { withSSREnsureWithRole } from '@server/middlewares/withSSREnsureWithRole';
import Calendar from '@components/Recommendations/Calendar';
import { BottomNavBar } from '@components/bottom-nav-bar';

const ManageRecommendations: NextPage = () => {
  return (
    <>
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col bg-white md:pl-64">
          <BottomNavBar />

          <main className="flex-1">
            <div className="p-8 xl:p-10">
              <main className="">
                <header className="flex items-center justify-between border-b border-black/5 py-4 sm:py-6">
                  <h1 className="text-base font-semibold leading-7">
                    recomendações diárias
                  </h1>

                  {/* Sort dropdown */}
                  {/* <div className="flex items-center space-x-1">
                    <CreateEventModal />
                  </div> */}
                </header>
                <div className="py-4">
                  <Calendar />
                </div>
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

export default ManageRecommendations;
