import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import Navbar from './Navbar';
import { signOut } from 'next-auth/react';

export default function MainContent() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <nav className="flex-1 space-y-2 px-4 py-2">
        <Navbar />
      </nav>
      <div className="mb-4 mt-auto w-full space-y-1 pt-10">
        <button
          onClick={() => {
            signOut({
              callbackUrl: '/login',
            });
          }}
          className="group flex w-full items-center border-l-4 border-transparent px-4 py-2 text-base font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-800 group-hover:text-gray-800"
        >
          <ArrowLeftOnRectangleIcon
            className="mr-4 h-6 w-6 text-gray-500 group-hover:text-gray-800"
            aria-hidden="true"
          />
          sair
        </button>
      </div>
    </div>
  );
}
