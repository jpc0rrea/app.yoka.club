import Header from '@components/Header';
import { type NextPage } from 'next';
import Head from 'next/head';

import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import RecordedClassesSection from '@components/RecordedClassesSection';
import RecommendationsOfTheWeek from '@components/Recommendations/RecommendationsOfTheWeek';

const RecordedClassesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>plataforma yoga com kaká</title>
      </Head>

      <div className="bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col bg-white md:pl-64">
          <Header />

          <main className="flex-1 bg-white">
            <RecommendationsOfTheWeek />
            <RecordedClassesSection />
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
