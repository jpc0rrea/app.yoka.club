import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { queryClient } from '@lib/queryClient';
import { Loader2 } from 'lucide-react';

interface AddMoreCheckInsToUserProps {
  userId: string;
}

export default function AddMoreCheckInsToUser({
  userId,
}: AddMoreCheckInsToUserProps) {
  const [open, setOpen] = useState(false);
  const [checkInsQuantity, setCheckInsQuantity] = useState(1);
  const [isAddingCheckIns, setIsAddingCheckIns] = useState(false);

  const handleAddCheckIn = async () => {
    setIsAddingCheckIns(true);

    try {
      await api.post('/admin/users/add-check-in', {
        userId,
        checkInsQuantity,
      });

      queryClient.invalidateQueries({
        queryKey: ['users'],
      });

      await queryClient.refetchQueries({
        queryKey: ['users'],
      });

      successToast({
        message: `${checkInsQuantity} check-ins adicionados com sucesso :)`,
      });
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
      });
    }

    setIsAddingCheckIns(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800"
      >
        adicionar check-ins
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
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
                    <div className="mt text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-purple-700"
                      >
                        adicionar check-ins
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          número de check-ins
                        </p>
                        <div className="mt-1 flex items-center justify-center">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2"
                            onClick={() => {
                              if (checkInsQuantity > 1) {
                                setCheckInsQuantity(checkInsQuantity - 1);
                              }
                            }}
                          >
                            <MinusIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </button>
                          <p className="mx-2 text-xl font-bold text-purple-800">
                            {checkInsQuantity}
                          </p>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2"
                            onClick={() => {
                              setCheckInsQuantity(checkInsQuantity + 1);
                            }}
                          >
                            <PlusIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-800 sm:col-start-1 sm:mt-0"
                      onClick={handleAddCheckIn}
                    >
                      {isAddingCheckIns ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'adicionar'
                      )}
                    </button>
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
