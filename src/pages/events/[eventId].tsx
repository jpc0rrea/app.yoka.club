import { CalendarIcon } from '@heroicons/react/20/solid';

import Header from '@components/Header';
import { type NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { useEventById } from '@hooks/useEvents';
import { Loader2 } from 'lucide-react';

const Event: NextPage = () => {
  const router = useRouter();
  const { data } = useSession();
  const eventId = router.query.eventId as string;

  const userId = data?.user?.id || '';

  const { data: event } = useEventById({ eventId });

  const alreadyCheckedId = event?.checkIns
    .map((checkIn) => checkIn.userId)
    .includes(userId);

  const eventAlreadyStarted =
    event && event.startDate ? new Date(event?.startDate) < new Date() : false;

  const recordedUrl = event?.recordedUrl;

  const liveUrl = event?.liveUrl;

  return (
    <>
      <Head>
        <title>plataforma yoga com kaká</title>
      </Head>

      <div>
        <Sidebar />
        <div className="flex flex-1 flex-col md:pl-64">
          <Header />

          {!event || !event.startDate ? (
            <Loader2 className="m-2 mt-4 h-4 w-4 animate-spin" />
          ) : (
            <main className="flex-1">
              <div className="py-8 xl:py-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 xl:grid xl:max-w-5xl xl:grid-cols-3">
                  <div className="xl:col-span-2 xl:border-r xl:border-gray-200 xl:pr-8">
                    <div>
                      <div>
                        <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
                          <div>
                            <h1 className="text-2xl font-bold text-purple-800">
                              {event.title}
                            </h1>
                            <p className="mt-2 flex text-sm text-gray-500">
                              <a
                                href={`/instructors/${event.instructor.id}`}
                                className="flex items-center"
                              >
                                <img
                                  className="mr-1 h-5 w-5 rounded-full"
                                  src={event.instructor.image || ''}
                                  alt=""
                                />
                                <div className="mx-1 text-sm font-medium text-purple-800">
                                  {event.instructor.displayName}
                                </div>
                              </a>
                              {eventAlreadyStarted
                                ? 'que comandou a prática'
                                : 'que irá comandar a prática'}
                            </p>
                          </div>
                          <div className="mt-4 flex space-x-3 md:mt-0">
                            {eventAlreadyStarted ? null : alreadyCheckedId ? (
                              <p className="text-sm text-gray-500">
                                check-in feito :)
                              </p>
                            ) : (
                              <button className="rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800">
                                fazer check-in
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 border-y-[1px] py-6 xl:mt-0 xl:border-y-0 xl:py-3 xl:pb-0 xl:pt-6">
                          {eventAlreadyStarted ? (
                            recordedUrl ? (
                              <a
                                href={recordedUrl}
                                className="rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800"
                              >
                                acesse a aula gravada aqui
                              </a>
                            ) : (
                              <p className="text-sm text-gray-500">
                                em breve um link para a aula gravada estará
                                disponível :)
                              </p>
                            )
                          ) : alreadyCheckedId ? (
                            liveUrl ? (
                              <a
                                href={liveUrl}
                                className="rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800"
                              >
                                acesse a aula ao vivo aqui
                              </a>
                            ) : (
                              <p className="text-sm text-gray-500">
                                em breve um link para a aula ao vivo estará
                                disponível :)
                              </p>
                            )
                          ) : (
                            <div>
                              <p className="text-sm text-gray-500">
                                faça check-in para ter acesso ao link da aula ao
                                vivo
                              </p>
                              <button className="mt-2 rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800">
                                fazer check-in
                              </button>
                            </div>
                          )}
                        </div>
                        <aside className="mt-8 xl:hidden">
                          <h2 className="sr-only">Details</h2>
                          <div className="space-y-5">
                            {/* <div className="flex items-center space-x-2">
                              <LockOpenIcon
                                className="h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                              <span className="text-sm font-medium text-green-700">
                                Open Issue
                              </span>
                            </div> */}
                            {/* <div className="flex items-center space-x-2">
                               <ChatBubbleLeftEllipsisIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              /> 
                              <span className="text-sm font-medium text-gray-900">
                                🔥🔥🔥
                              </span>
                            </div> */}
                            <div className="flex items-center space-x-2">
                              <CalendarIcon
                                className="h-5 w-5 text-purple-800"
                                aria-hidden="true"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {format(
                                  new Date(event.startDate),
                                  "dd/MM/yyyy' às 'HH:mm"
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="mt-6 space-y-8 border-b border-t border-gray-200 py-6">
                            <div>
                              <h2 className="text-sm font-medium text-gray-500">
                                alunos
                              </h2>
                              <ul className="mt-3 space-y-3">
                                {event.checkIns.length === 0 ? (
                                  <li className="text-sm text-gray-700">
                                    Nenhum aluno fez check-in nessa aula ainda
                                  </li>
                                ) : (
                                  event.checkIns.map((checkIn) => {
                                    return (
                                      <li
                                        className="flex items-start justify-start"
                                        key={checkIn.id}
                                      >
                                        <a
                                          href={`/users/${checkIn.userId}`}
                                          className="flex items-center space-x-3"
                                        >
                                          <div className="flex-shrink-0">
                                            <img
                                              className="h-5 w-5 rounded-full"
                                              src={checkIn.user.image || ''}
                                              alt={checkIn.user.displayName}
                                            />
                                          </div>
                                          <div className="text-xs font-medium leading-5 text-gray-500 ">
                                            <p className="whitespace-nowrap text-sm text-gray-800">
                                              {checkIn.user.displayName}
                                            </p>
                                            <p className="truncate">
                                              check-in feito em{' '}
                                              {format(
                                                new Date(checkIn.createdAt),
                                                "dd/MM/yyyy' às 'HH:mm"
                                              )}
                                            </p>
                                          </div>
                                        </a>
                                      </li>
                                    );
                                  })
                                )}
                              </ul>
                            </div>
                            {/* <div>
                              <h2 className="text-sm font-medium text-gray-500">
                                Tags
                              </h2>
                              <ul className="mt-2 leading-8">
                                <li className="inline">
                                  <a
                                    href="#"
                                    className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                  >
                                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                                      <span
                                        className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="ml-3 text-xs font-semibold text-gray-900">
                                      Bug
                                    </div>
                                  </a>{' '}
                                </li>
                                <li className="inline">
                                  <a
                                    href="#"
                                    className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                  >
                                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                                      <span
                                        className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="ml-3 text-xs font-semibold text-gray-900">
                                      Accessibility
                                    </div>
                                  </a>{' '}
                                </li>
                              </ul>
                            </div> */}
                          </div>
                        </aside>
                      </div>
                    </div>
                  </div>
                  <aside className="hidden xl:block xl:pl-8">
                    <h2 className="sr-only">Details</h2>
                    <div className="space-y-5">
                      {/* <div className="flex items-center space-x-2">
                        <LockOpenIcon
                          className="h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-green-700">
                          Open Issue
                        </span>
                      </div> */}
                      {/* <div className="flex items-center space-x-2">
                         <BoltIcon
                          className="h-5 w-5 text-purple-800"
                          aria-hidden="true"
                        /> 
                        <span className="text-sm font-medium text-gray-900">
                          🔥🔥🔥
                        </span>
                      </div> */}
                      <div className="flex items-center space-x-2">
                        <CalendarIcon
                          className="h-5 w-5 text-purple-800"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {format(
                            new Date(event.startDate),
                            "dd/MM/yyyy' às 'HH:mm"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-8 border-t border-gray-200 py-6">
                      <div>
                        <h2 className="text-sm font-medium text-gray-500">
                          alunos
                        </h2>
                        <ul className="mt-3 space-y-3">
                          {event.checkIns.length === 0 ? (
                            <li className="text-sm text-gray-700">
                              Nenhum aluno fez check-in nessa aula ainda
                            </li>
                          ) : (
                            event.checkIns.map((checkIn) => {
                              return (
                                <li
                                  className="flex items-start justify-start"
                                  key={checkIn.id}
                                >
                                  <a
                                    href={`/users/${checkIn.userId}`}
                                    className="flex items-center space-x-3"
                                  >
                                    <div className="flex-shrink-0">
                                      <img
                                        className="h-5 w-5 rounded-full"
                                        src={checkIn.user.image || ''}
                                        alt={checkIn.user.displayName}
                                      />
                                    </div>
                                    <div className="text-xs font-medium leading-5 text-gray-500">
                                      <p className="whitespace-nowrap text-sm text-gray-800">
                                        {checkIn.user.displayName}
                                      </p>

                                      <p className="truncate">
                                        check-in feito em{' '}
                                        {format(
                                          new Date(checkIn.createdAt),
                                          "dd/MM/yyyy' às 'HH:mm"
                                        )}
                                      </p>
                                    </div>
                                  </a>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </div>
                      {/* <div>
                        <h2 className="text-sm font-medium text-gray-500">
                          Tags
                        </h2>
                        <ul className="mt-2 leading-8">
                          <li className="inline">
                            <a
                              href="#"
                              className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-xs font-semibold text-gray-900">
                                Bug
                              </div>
                            </a>{' '}
                          </li>
                          <li className="inline">
                            <a
                              href="#"
                              className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-xs font-semibold text-gray-900">
                                Accessibility
                              </div>
                            </a>{' '}
                          </li>
                        </ul>
                      </div> */}
                    </div>
                  </aside>
                </div>
              </div>
            </main>
          )}
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

export default Event;
