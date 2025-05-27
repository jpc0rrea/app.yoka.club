import Header from '@components/Header';
import { type NextPage } from 'next';

import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import Calendar from '@components/Calendar';
import NextEventsSection from '@components/NextEventsSection';
import HappeningNowEvents from '@components/HappeningNowEvents';
import OnboardingUserModal from '@components/Modals/OnboardingUserModal';
import { BottomNavBar } from '@components/bottom-nav-bar';
import { useRouter } from 'next/navigation';

const Home: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <BottomNavBar />

          <main className="flex-1 bg-white">
            <OnboardingUserModal />
            <HappeningNowEvents />
            <NextEventsSection />
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                  calendário
                </h1>
              </div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {/* Replace with your content */}
                <div className="py-4">
                  <Calendar />
                </div>
                {/* /End replace */}
              </div>
            </div>
            <BottomNavBar activeSection="live" />
          </main>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = withSSREnsureSubscribed(async () => {
  return {
    props: {},
  };
});

export default Home;
