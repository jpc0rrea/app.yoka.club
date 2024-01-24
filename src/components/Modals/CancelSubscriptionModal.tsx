import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { Loader2 } from 'lucide-react';
import { queryClient } from '@lib/queryClient';

interface CancelSubscriptionModalProps {
  expirationDate: Date;
}

export default function CancelSubscriptionModal({
  expirationDate,
}: CancelSubscriptionModalProps) {
  const [open, setOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const cancelButtonRef = useRef(null);

  const handleCancelSubscription = async () => {
    setIsCanceling(true);

    try {
      await api.delete('/user/cancel-subscription');

      successToast({
        message: 'plano cancelado com sucesso',
        description:
          'você ainda terá acesso aos conteúdos exclusivos até ' +
          format(new Date(expirationDate), "dd/MM/yyyy' às 'HH:mm") +
          '.',
      });

      queryClient.invalidateQueries(['userPlan']);
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
      });
    }

    setIsCanceling(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="rounded bg-red-50 px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
      >
        cancelar plano
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
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        cancelar plano
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          você tem certeza que deseja cancelar o seu plano? você
                          ainda terá acesso aos conteúdos exclusivos até{' '}
                          <strong className="text-gray-800">
                            {format(
                              new Date(expirationDate),
                              "dd/MM/yyyy' às 'HH:mm"
                            )}
                          </strong>
                          .
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-500">
                          não se preocupe, você ainda poderá usar seus check-ins
                          restantes após o plano expirar :)
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={handleCancelSubscription}
                    >
                      {isCanceling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'sim, cancelar o meu plano'
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      não
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
