import { Fragment, useCallback, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { SegmentedControl } from '@mantine/core';
import { convertNumberToReal } from '@lib/utils';
import {
  getFullPricePerBillingPeriod,
  getPlanPricePerMonth,
} from '@hooks/useUserPlan';
import { api } from '@lib/api';
import { getStripeJs } from '@lib/stripe';
import { errorToast } from '@components/Toast/ErrorToast';
import { Loader2 } from 'lucide-react';
import { cn } from '@utils';

interface SubscribeModalProps {
  label: string;
  className?: string;
}

export default function SubscribeModal({
  label,
  className,
}: SubscribeModalProps) {
  const [open, setOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<string>('quarterly');
  const [checkInsQuantity, setCheckInsQuantity] = useState<number>(8);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);

  const handleRedirectToCheckout = useCallback(async () => {
    setIsRedirectingToCheckout(true);

    try {
      const checkoutSessionResponse = await api.post<{ sessionId: string }>(
        '/users/checkout-session',
        {
          billingPeriod,
          checkInsQuantity,
        }
      );

      const sessionId = checkoutSessionResponse.data.sessionId;

      const stripe = await getStripeJs();

      if (!stripe) {
        errorToast({
          message: 'ocorreu um erro ao redirecionar para o checkout',
        });

        setIsRedirectingToCheckout(false);
        return;
      }

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.log(err);
      errorToast({
        message: 'ocorreu um erro ao redirecionar para o checkout',
      });
    } finally {
      setIsRedirectingToCheckout(false);
    }
  }, [billingPeriod, checkInsQuantity]);

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className={cn(
          'rounded bg-purple-700 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-800',
          className
        )}
      >
        {label}
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
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
                        planos - yoga com kaká
                      </Dialog.Title>
                      <div className="items-center justify-between md:flex">
                        <div className="mt-2">
                          <p className="text-xs text-gray-800">
                            escolha a frequência
                          </p>
                          <SegmentedControl
                            value={billingPeriod}
                            onChange={setBillingPeriod}
                            size="xs"
                            className="mt-1"
                            data={[
                              { label: 'Mensal', value: 'monthly' },
                              { label: 'Trimestral', value: 'quarterly' },
                            ]}
                          />
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-800">
                            escolha a quantidade de check-ins
                          </p>
                          <SegmentedControl
                            value={String(checkInsQuantity)}
                            onChange={(value) => {
                              setCheckInsQuantity(Number(value));
                            }}
                            className="ml-2 mt-1"
                            size="xs"
                            data={[
                              { label: '0 check-ins/mês', value: '0' },
                              { label: '8 check-ins/mês', value: '8' },
                              { label: '12 check-ins/mês', value: '12' },
                            ]}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center ">
                        <div className="mx-auto flex items-end">
                          <p className="text-xl font-bold text-purple-800">
                            {convertNumberToReal(
                              getPlanPricePerMonth({
                                billingPeriod: billingPeriod as
                                  | 'monthly'
                                  | 'quarterly',
                                checkInsQuantity,
                              })
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {billingPeriod === 'monthly' ? '/mês' : '/mês*'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <ArrowPathIcon className="inline-block h-5 w-5 text-purple-800" />

                        <p className="ml-1 text-sm text-gray-700">
                          <strong className="text-purple-800">
                            {checkInsQuantity}
                          </strong>{' '}
                          check-ins por mês
                        </p>
                      </div>
                      <div className="mt-2 flex items-center">
                        <SparklesIcon className="inline-block h-5 w-5 text-purple-800" />

                        <p className="ml-1 text-sm font-bold text-purple-800">
                          acesso a conteúdos exclusivos
                        </p>
                      </div>
                      <div className="mt-3">
                        <p className="text-left text-sm text-gray-500">
                          você pode cancelar a qualquer momento :)
                        </p>
                      </div>
                      {billingPeriod === 'quarterly' && (
                        <div className="mt-1 flex items-center">
                          <p className="text-left text-sm text-gray-500">
                            * pagamento único de{' '}
                            {convertNumberToReal(
                              getFullPricePerBillingPeriod({
                                billingPeriod: billingPeriod as
                                  | 'monthly'
                                  | 'quarterly',
                                checkInsQuantity,
                              })
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      className="inline-flex w-full items-center justify-center rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-800"
                      onClick={handleRedirectToCheckout}
                    >
                      {isRedirectingToCheckout ? (
                        <Loader2 className="h-5 w-5 text-white" />
                      ) : (
                        'assinar a plataforma'
                      )}
                    </button>
                    {/* <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-800 sm:col-start-2"
                      onClick={() => setOpen(false)}
                    >
                      pagamento avulso (pix)
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-800 sm:col-start-1 sm:mt-0"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      pagamento recorrente (cartão de crédito)
                    </button> */}
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
