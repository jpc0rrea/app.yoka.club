// import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
  Bars3BottomLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useSidebar } from '@hooks/useSidebar';
import Profile from './Profile';
// import ConfirmEmailAlert from './ConfirmEmailAlert';
import useUser from '@hooks/useUser';

export default function Header() {
  const { setIsSidebarOpen } = useSidebar();
  const { user } = useUser();

  return (
    <>
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
            {/* <button className="my-auto h-min rounded-md p-1 hover:bg-gray-100">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            </button> */}
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {user && (
              <div className="font-semi flex flex-col items-center text-xs text-gray-500">
                <CheckCircleIcon className="inline-block h-5 w-5 text-purple-800" />
                <p>
                  <strong className="font-bold text-purple-800">
                    {user.checkInsQuantity}
                  </strong>{' '}
                  check-in{user.checkInsQuantity !== 1 && 's'}
                </p>
                {/* <p className="text-[9px]">restantes</p> */}
              </div>
            )}
            <Profile />
          </div>
        </div>
      </div>
      {/* <ConfirmEmailAlert /> */}
    </>
  );
}
