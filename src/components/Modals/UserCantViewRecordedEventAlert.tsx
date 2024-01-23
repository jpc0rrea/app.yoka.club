import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import SubscribeModal from './SubscribeModal';

export default function UserCantViewRecordedClassAlert() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="flex min-w-max max-w-fit justify-center rounded-md border border-transparent bg-brand-purple-900 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-brand-purple-800 focus:outline-none"
      >
        ir para aula
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40"
          // initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    {/* <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div> */}
                    <div className="mt text-center">
                      <Dialog.Title
                        as="h3"
                        className="mb-2 text-base font-semibold leading-6 text-purple-700"
                      >
                        que pena, você não tem permissão para ver essa aula :(
                      </Dialog.Title>

                      <Dialog.Description>
                        <p className="text-sm text-gray-600">
                          somente assinantes ou alunas que fizeram check-in
                          podem ver a gravação dessa aula
                        </p>
                        <SubscribeModal
                          label="escolher o meu plano"
                          className="w-100% mt-4"
                        />
                      </Dialog.Description>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
