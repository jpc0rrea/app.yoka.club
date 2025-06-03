import Header from '@components/Header';
import { type NextPage } from 'next';

import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import RecordedClassesSection from '@components/RecordedClassesSection';
import { BottomNavBar } from '@components/bottom-nav-bar';
import { useRouter } from 'next/navigation';

const RecordedClassesPage: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col pt-4 md:pl-64">
          <main className="flex-1 bg-white pb-20 md:pb-0">
            <RecordedClassesSection />
            <BottomNavBar activeSection="record" />
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

export default RecordedClassesPage;
