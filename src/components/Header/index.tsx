import { errorToast } from '@components/Toast/ErrorToast';
import { successToast } from '@components/Toast/SuccessToast';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { useSidebar } from '@hooks/useSidebar';
import { api } from '@lib/api';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { BeatLoader } from 'react-spinners';
import Profile from './Profile';

export default function Header() {
  const { setIsSidebarOpen } = useSidebar();
  const session = useSession();
  const [isSending, setIsSending] = useState(false);

  console.log(session);

  const hasEmailVerified = session.data?.user?.emailVerified;

  const handleSendConfirmationEmail = async () => {
    setIsSending(true);

    const response = await api.post('/users/send-confirmation-email');

    if (response.status === 200) {
      setIsSending(false);
      successToast({
        message: 'enviamos um e-mail de confirmação',
        description: 'verifique sua caixa de entrada',
      });
    } else {
      setIsSending(false);
      errorToast({
        message: 'não foi possível enviar o e-mail de confirmação',
        description: 'tente novamente mais tarde',
      });
    }
  };

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none md:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1">
          <button className="my-auto h-min rounded-md p-1 hover:bg-gray-100">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          {!hasEmailVerified && session.status !== 'loading' && (
            <button
              type="button"
              className="inline-flex w-48 items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-100 focus:ring-offset-2"
              onClick={handleSendConfirmationEmail}
            >
              <ExclamationCircleIcon
                className="-ml-1 mr-2 h-5 w-5"
                aria-hidden="true"
              />
              {isSending ? (
                <div className="flex w-full justify-center">
                  <BeatLoader
                    color="#b91c1c"
                    size={7}
                    cssOverride={{
                      height: '1.25rem',
                    }}
                    className="translate-y-[4px] transform"
                  />
                </div>
              ) : (
                'Verifique sua conta'
              )}
            </button>
          )}
          <Profile />
        </div>
      </div>
    </div>
  );
}
