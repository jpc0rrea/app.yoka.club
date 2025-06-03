import Header from '@components/Header';
import { type NextPage } from 'next';

import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import RecordedClassesSection from '@components/RecordedClassesSection';
import RecommendationsOfTheWeek from '@components/Recommendations/RecommendationsOfTheWeek';
import { BottomNavBar } from '@components/bottom-nav-bar';
import { RecommendationClassSection } from '@components/recommention-class-section';
import { useRouter } from 'next/navigation';

const RecordedClassesPage: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <div className="bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col bg-white md:pl-64">
          <main className="flex-1 bg-white pb-20 md:pb-0">
            <RecommendationsOfTheWeek />

            <BottomNavBar activeSection="home" />
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
