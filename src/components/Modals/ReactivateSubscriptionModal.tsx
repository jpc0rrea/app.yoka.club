import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { api } from '@lib/api';
import { successToast } from '@components/Toast/SuccessToast';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { Loader2 } from 'lucide-react';
import { queryClient } from '@lib/queryClient';
import { Button } from '@components/ui/button';

export default function ReactivateSubscriptionModal() {
  const [open, setOpen] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const cancelButtonRef = useRef(null);

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);

    try {
      await api.post('/user/reactivate-subscription');

      successToast({
        message: 'Plano reativado com sucesso',
        description:
          'Seu plano foi reativado e você terá acesso imediato aos conteúdos exclusivos.',
      });

      queryClient.invalidateQueries(['userPlan']);
      setOpen(false);
    } catch (err) {
      const { message, description } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
        description,
      });
    }

    setIsReactivating(false);
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => {
          setOpen(true);
        }}
        className="rounded px-2.5 py-1.5 text-sm font-semibold shadow-sm"
      >
        Reativar plano
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={setOpen}>
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
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <CheckCircleIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Reativar plano
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Você tem certeza que deseja reativar o seu plano? Você
                          terá acesso imediato aos conteúdos exclusivos e sua
                          assinatura será renovada.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Button
                      variant="default"
                      type="button"
                      className="inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
                      onClick={handleReactivateSubscription}
                    >
                      {isReactivating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Sim, reativar meu plano'
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Não
                    </Button>
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
