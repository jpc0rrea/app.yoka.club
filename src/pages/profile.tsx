import Header from '@components/Header';
import { type NextPage } from 'next';
import Head from 'next/head';
import Sidebar from '@components/Sidebar';
import { withSSREnsureSubscribed } from 'server/middlewares/withSSREnsureSubscribed';
import { Input } from '@components/Form/Input';
import { signIn, useSession } from 'next-auth/react';
import { CheckIcon } from '@heroicons/react/20/solid';

const Profile: NextPage = () => {
  const session = useSession();

  const hasConnectedAgenda = !!session.data?.user?.accounts.find((account) => {
    return account.provider === 'google';
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
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {/* Replace with your content */}
                <form className="space-y-8 divide-y divide-gray-200">
                  <div className="space-y-8 divide-y divide-gray-200">
                    <div>
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          perfil
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          essas informações vão estar disponíveis para outras
                          yogis :)
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <Input
                            name="nome"
                            label="nome"
                            helperText="esse é o nome que ficará disponível para os outros usuários"
                          />
                        </div>

                        {/* <div className="sm:col-span-4">
                          <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                          >
                            nome de usuário
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                              yogacomkaka.com/
                            </span>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              autoComplete="username"
                              className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-6">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium text-gray-700"
                          >
                            sobre
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="about"
                              name="about"
                              rows={3}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              defaultValue={''}
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            fale um pouquinho sobre você
                          </p>
                        </div> */}

                        <div className="sm:col-span-6">
                          <label
                            htmlFor="photo"
                            className="ml-2 block text-sm font-medium text-gray-700"
                          >
                            foto
                          </label>
                          <div className="mt-1 flex items-center">
                            <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                              <svg
                                className="h-full w-full text-gray-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </span>
                            <button
                              type="button"
                              className="ml-5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              atualizar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          informações pessoais
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          usaremos seu endereço de e-mail para enviar
                          notificações
                        </p>
                      </div>
                      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                          <Input name="" label="nome completo" />
                        </div>

                        <div className="sm:col-span-4">
                          <Input name="" label="e-mail" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          notificações
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          nós só vamos te comunicar coisas importantes, mas
                          escolha só as que você quiser receber :)
                        </p>
                      </div>
                      <div className="mt-6">
                        <fieldset>
                          <legend className="sr-only">By Email</legend>
                          <div
                            className="text-base font-medium text-gray-900"
                            aria-hidden="true"
                          >
                            por e-mail
                          </div>
                          <div className="mt-4 space-y-4">
                            <div className="relative flex items-start">
                              <div className="flex h-5 items-center">
                                <input
                                  id="comments"
                                  name="comments"
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor="comments"
                                  className="font-medium text-gray-700"
                                >
                                  aulas ao vivo
                                </label>
                                <p className="text-gray-500">
                                  seja notificado quando uma nova aula ao vivo
                                  for postada.
                                </p>
                              </div>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="sm:flex sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            conecte sua agenda
                          </h3>
                          <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>
                              conecte sua conta com o google agenda para
                              podermos adicionar eventos sobre as suas aulas ao
                              vivo
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
                          {hasConnectedAgenda ? (
                            <div className="inline-flex cursor-not-allowed items-center rounded-md border border-transparent bg-gray-400 px-4 py-2 font-medium text-white shadow-sm sm:text-sm">
                              conectado
                              <CheckIcon className="ml-2 h-4 w-4" />
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                signIn('google', {
                                  callbackUrl: '/profile',
                                });
                              }}
                              className="inline-flex items-center rounded-md border border-transparent bg-purple-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-purple-900"
                            >
                              conectar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 "
                      >
                        cancelar
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-purple-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-900 "
                      >
                        salvar
                      </button>
                    </div>
                  </div>
                </form>
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

export default Profile;
