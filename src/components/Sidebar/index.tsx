import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSidebar } from '@hooks/useSidebar';
import Image from 'next/image';
import MainContent from './MainContext';
import { Button } from '@components/ui/button';

export default function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  // when the route changes (page is changed) we close the sidebar
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);

  return (
    <>
      <Transition.Root show={isSidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 md:hidden"
          onClose={setIsSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4 pt-5">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute right-0 top-0  pt-2">
                    <Button
                      variant="icon"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 shrink-0 text-gray-500"
                        aria-hidden="true"
                      />
                    </Button>
                  </div>
                </Transition.Child>
                <div className="flex flex-shrink-0 items-center px-4">
                  <Image
                    className="h-7 w-auto"
                    src="/images/yoka-club/yoka-horizontal-roxo.svg"
                    alt="Logo Yoka Club"
                    width={300}
                    height={100}
                  />
                </div>
                <MainContent />
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="md:flex-cols hidden md:fixed md:inset-y-0 md:flex md:w-64">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
          <div className="flex flex-shrink-0 items-center px-6">
            <Image
              className="h-7 w-auto"
              src="/images/yoka-club/yoka-horizontal-roxo.svg"
              alt="Logo Yoka Club"
              width={300}
              height={100}
            />
          </div>
          <MainContent />
        </div>
      </div>
    </>
  );
}
