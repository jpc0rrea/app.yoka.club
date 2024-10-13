import React, {
  ButtonHTMLAttributes,
  Fragment,
  useCallback,
  useState,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { convertNumberToReal } from '@lib/utils';
import { calculatePricePerCheckin } from '@lib/constants';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { Loader2 } from 'lucide-react';
import { Button } from '@components/ui/button';

interface BuyMoreCheckInsProps {
  title?: string;
  ctaText?: string;
  description?: string;
  CTAButton?: React.FC<ButtonHTMLAttributes<HTMLButtonElement>>;
}

const discountOptionStyle =
  'rounded bg-green-100 px-2 py-1 font-bold text-green-500';
const normalOptionStyle = 'text-sm text-green-500';

export default function BuyMoreCheckIns({
  title = 'comprar mais check-ins',
  ctaText = 'comprar mais',
  description = 'escolha a quantidade que deseja comprar',
  CTAButton,
}: BuyMoreCheckInsProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkInsQuantity, setCheckInsQuantity] = useState(4);

  const handleCreatePaymentWithPix = useCallback(async () => {
    setIsLoading(true);
    try {
      const checkoutResponse = await api.post<{
        checkoutUrl: string;
      }>('mercadopago/checkout', {
        checkInsQuantity,
      });

      // redirecionar usuário para o checkoutUrl
      window.location.href = checkoutResponse.data.checkoutUrl;
    } catch (err) {
      console.log(err);

      const { message } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
      });
    }
    setIsLoading(false);
  }, [checkInsQuantity]);

  const pricePerCheckIn = calculatePricePerCheckin(checkInsQuantity);
  const totalCost = convertNumberToReal(checkInsQuantity * pricePerCheckIn);
  const checkInUnityPrice = convertNumberToReal(pricePerCheckIn);

  return (
    <>
      {CTAButton ? (
        <CTAButton
          onClick={() => {
            setOpen(true);
          }}
          className="mt-2 w-full"
        >
          {ctaText}
        </CTAButton>
      ) : (
        <Button
          onClick={() => {
            setOpen(true);
          }}
          className="rounded px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm"
        >
          {ctaText}
        </Button>
      )}
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="4-10 relative"
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
                    <div className="absolute right-0 top-0  pt-2">
                      <Button
                        variant={`secondary`}
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-gray-500"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                    <div className="mt text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="mb-2 text-base font-semibold leading-6 text-purple-700"
                      >
                        {title}
                      </Dialog.Title>
                      {/* <Dialog.Description>
                        <p className="text-sm text-gray-600">{description}</p>
                      </Dialog.Description> */}
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{description}</p>
                        <div className="mt-1 flex items-center justify-center">
                          <Button
                            variant={`secondary`}
                            type="button"
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
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
                          </Button>
                          <p className="mx-2 text-xl font-bold text-purple-800">
                            {checkInsQuantity}
                          </p>
                          <Button
                            variant={`secondary`}
                            type="button"
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                            onClick={() => {
                              setCheckInsQuantity(checkInsQuantity + 1);
                            }}
                          >
                            <PlusIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col items-center ">
                        <p className="text-sm text-gray-500">total</p>
                        <div className="mx-auto flex items-end">
                          <p className="text-xl font-bold text-purple-800">
                            {totalCost}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <CheckCircleIcon className="inline-block h-5 w-5 text-purple-800" />

                        <p className="ml-1 text-sm text-gray-700">
                          <strong className="text-purple-800">
                            {checkInUnityPrice}
                          </strong>{' '}
                          por check-in
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <Button
                      variant={`secondary`}
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-800 sm:col-start-2"
                      onClick={handleCreatePaymentWithPix}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 text-white" />
                      ) : (
                        `comprar ${checkInsQuantity} check-ins`
                      )}
                    </Button>
                    {/* <Button
                    variant={`secondary`}
                      type="button"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-800 sm:col-start-1 sm:mt-0"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      pagar com cartão de crédito
                    </Button> */}
                  </div>
                  <div className="mt-4 text-center text-sm">
                    <span className="text-gray-600">desconto progressivo</span>
                    <br />
                    <span
                      className={
                        pricePerCheckIn === 28
                          ? discountOptionStyle
                          : normalOptionStyle
                      }
                    >
                      7% de desconto comprando a partir de 4 check-ins
                    </span>
                    <br />
                    <span
                      className={
                        pricePerCheckIn === 26
                          ? discountOptionStyle
                          : normalOptionStyle
                      }
                    >
                      14% de desconto comprando a partir de 8 check-ins
                    </span>
                    <br />
                    <span
                      className={
                        pricePerCheckIn === 22
                          ? discountOptionStyle
                          : normalOptionStyle
                      }
                    >
                      27% de desconto comprando 12 check-ins ou mais
                    </span>
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
