import Header from '@components/Header';
import { type NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@components/Sidebar';
import { withSSREnsureWithRole } from '@server/middlewares/withSSREnsureWithRole';
import UsersTable from '@components/Admin/UsersTable';

const ManageUsers: NextPage = () => {
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
                  <h1 className="text-base font-semibold leading-7">
                    usuários
                  </h1>

                  {/* Sort dropdown */}
                  {/* <div className="flex items-center space-x-1">
                    <CreateEventModal />
                  </div> */}
                </header>

                <UsersTable />
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

export default ManageUsers;
