import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import Navbar from './Navbar';
import useUser from '@hooks/useUser';
import { Button } from '@components/ui/button';

export default function MainContent() {
  const { logout } = useUser();
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <nav className="flex-1 space-y-2 px-4 py-2">
        <Navbar />
      </nav>
      <div className="mb-4 mt-auto w-full space-y-1 pt-10">
        <Button
          variant="secondary"
          onClick={logout}
          className="group flex w-full items-center justify-start border-l-4 border-transparent bg-white px-4 py-2 text-base font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-800 group-hover:text-gray-800"
        >
          <ArrowLeftOnRectangleIcon
            className="mr-4 h-6 w-6 text-gray-500 group-hover:text-gray-800"
            aria-hidden="true"
          />
          sair
        </Button>
      </div>
    </div>
  );
}
