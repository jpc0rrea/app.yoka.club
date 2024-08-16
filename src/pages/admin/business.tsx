import { useState } from 'react';
import { type NextPage } from 'next';
import Head from 'next/head';
import { startOfMonth } from 'date-fns';
import {
  BarChart,
  Card as TremorCard,
  DateRangePicker,
  DateRangePickerValue,
} from '@tremor/react';
import { pt } from 'date-fns/locale';

import Sidebar from '@components/Sidebar';
import useBusinessInformations from '@hooks/useBusinessInformations';
import Header from '@components/Header';
import { withSSREnsureWithRole } from '@server/middlewares/withSSREnsureWithRole';
import { Loader2 } from 'lucide-react';
import WatchedEventsTable from '@components/Business/WatchedEventsTable';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import NewUsersTable from '@components/Business/NewUsersTable';

const BusinessInformations: NextPage = () => {
  const [dates, setDates] = useState<DateRangePickerValue>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const { data: businessInfomations, isLoading } = useBusinessInformations({
    dates,
  });

  const categories =
    businessInfomations?.newUsersPerDay.map((item) => item.date) || [];

  console.log({
    categories,
    businessInfomations,
  });

  const dataFormatter = (number: number) =>
    Intl.NumberFormat('br').format(number).toString();
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
              <main className="">
                <header className="w-full items-center justify-between py-4 sm:py-6">
                  <h1 className="text-base font-semibold leading-7">
                    business
                  </h1>

                  {/* Sort dropdown */}
                  {/* <div className="flex items-center space-x-1">
                    <CreateEventModal />
                  </div> */}
                  <DateRangePicker
                    className="mt-4 max-w-[288px]"
                    value={dates}
                    onValueChange={setDates}
                    enableSelect={false}
                    locale={pt}
                    selectPlaceholder="Selecionar"
                  />
                </header>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <TremorCard className="col-span-4 mx-auto">
                    <CardTitle className="text-gray-900">
                      novos usuários por dia
                    </CardTitle>
                    {isLoading || !businessInfomations ? (
                      <div>
                        <Loader2 className="mt-2 animate-spin" />
                      </div>
                    ) : (
                      <BarChart
                        data={businessInfomations.newUsersPerDay}
                        index="date"
                        categories={['usuários']}
                        colors={['purple']}
                        valueFormatter={dataFormatter}
                      />
                    )}
                  </TremorCard>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle className="text-gray-900">
                        novos usuários
                      </CardTitle>
                      {businessInfomations && (
                        <CardDescription>
                          <strong className="text-brand-purple-800">
                            {businessInfomations.newUsersCount}
                          </strong>{' '}
                          novos usuários nesse período
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <NewUsersTable
                        newUsersTableData={
                          businessInfomations?.newUsersTableData
                        }
                      />
                    </CardContent>
                  </Card>
                </div>

                <WatchedEventsTable
                  watchedEventsTableData={
                    businessInfomations?.watchedEventsTableData
                  }
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
}, ['ADMIN']);

export default BusinessInformations;
