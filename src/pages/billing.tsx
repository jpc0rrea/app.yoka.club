import Header from '@components/Header';
import { type NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import UserPlan from '@components/Billing/UserPlan';
import UserPayments from '@components/Billing/UserPayments';

const Billing: NextPage = () => {
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
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {/* Replace with your content */}
                <div className="space-y-8 divide-y divide-gray-200">
                  <UserPlan />
                  <UserPayments />
                </div>
                {/* /End replace */}
              </div>
            </div>
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

export default Billing;
