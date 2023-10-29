import Header from '@components/Header';
import { type NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@components/Sidebar';
import { withSSREnsureWithRole } from '@server/middlewares/withSSREnsureWithRole';
import CreateEventModal from '@components/Modals/CreateEventModal';
import { useEvents } from '@hooks/useEvents';
import { Loader2 } from 'lucide-react';
import EventInManageSection from '@components/Events/EventInManageSection';
import useUser from '@hooks/useUser';

const Event: NextPage = () => {
  const { user } = useUser();
  const { data: events, isLoading } = useEvents({
    pageSize: 1000,
    instructorId: user && user.role === 'ADMIN' ? undefined : user?.id,
    enabled: !!user,
  });

  return (
    <>
      <Head>
        <title>plataforma yoga com kaká</title>
      </Head>

      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <Header />

          <main className="flex-1">
            <div className="p-8 xl:p-10">
              <main className="max-w-4xl">
                <header className="flex items-center justify-between border-b border-black/5 py-4 sm:py-6">
                  <h1 className="text-base font-semibold leading-7">eventos</h1>

                  {/* Sort dropdown */}
                  <div className="flex items-center space-x-1">
                    <CreateEventModal />
                  </div>
                </header>

                <ul className="divide-y divide-gray-100">
                  {!events || isLoading ? (
                    <Loader2 className="mr-2 mt-4 h-4 w-4 animate-spin" />
                  ) : events.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-500">
                      nenhum evento encontrado
                    </p>
                  ) : (
                    events.map((event) => {
                      return (
                        <EventInManageSection key={event.id} event={event} />
                      );
                    })
                  )}
                </ul>
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
