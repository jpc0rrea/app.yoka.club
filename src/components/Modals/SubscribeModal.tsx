import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { RadioGroup } from '@headlessui/react';
// import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';
// import { SegmentedControl } from '@mantine/core';
// import { convertNumberToReal } from '@lib/utils';
// import {
//   getFullPricePerBillingPeriod,
//   getPlanPricePerMonth,
// } from '@hooks/useUserPlan';
import { api } from '@lib/api';
import { getStripeJs } from '@lib/stripe';
import { errorToast } from '@components/Toast/ErrorToast';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@utils';
import clsx from 'clsx';
import { Button } from '@components/ui/button';
import { BillingPeriod, PlanCode } from '@lib/stripe/plans';
import convertErrorMessage from '@lib/error/convertErrorMessage';

interface SubscribeModalProps {
  title?: string;
  ctaText?: string;
  description?: string;
  CTAButton?: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  className?: string;
}

export const plans = [
  // {
  //   name: 'plano gratuito',
  //   id: 'free' as PlanCode,
  //   code: 'free' as PlanCode,
  //   checkInsQuantityPerMonth: 0,
  //   featured: false,
  //   price: {
  //     monthly: 'R$ 0,00',
  //     quarterly: 'R$ 0,00',
  //     fullQuarterlyPrice: 'R$ 0,00',
  //   },
  //   description:
  //     'para quem quer começar a praticar yoga e conhecer a plataforma',
  //   button: {
  //     label: 'escolher plano gratuito',
  //     href: 'https://app.yogacomkaka.com/register',
  //   },
  //   includedFeatures: ['acesso as aulas gratuitas da plataforma'],
  //   excludedFeatures: [
  //     'acesso a mais de 60 aulas exclusivas',
  //     'acesso a comunidade exclusiva',
  //     'acesso ao suporte exclusivo da kaká',
  //     'acesso as aulas ao vivo',
  //   ],
  // },
  {
    name: 'plano zen',
    id: 'zen' as PlanCode,
    code: 'zen' as PlanCode,
    checkInsQuantityPerMonth: 0,
    featured: true,
    price: {
      monthly: 'R$ 99,90',
      quarterly: 'R$ 69,90',
      fullQuarterlyPrice: 'R$ 209,70',
    },
    description:
      'você está começando a praticar yoga e quer ter acesso a todas as aulas e a nossa comunidade',
    recurringButton: {
      label: 'assinar',
      // href: 'https://app.yogacomkaka.com/register',
    },
    oneTimeButton: {
      label: 'pagamento com pix',
    },
    includedFeatures: [
      'acesso as aulas gratuitas da plataforma',
      'acesso a mais de 60 aulas exclusivas',
      'acesso a comunidade exclusiva',
      'acesso ao suporte exclusivo da kaká',
      'acesso as aulas ao vivo',
    ],
    excludedFeatures: [],
  },
  // {
  //   name: 'plano flow',
  //   code: 'flow' as PlanCode,
  //   checkInsQuantityPerMonth: 8,
  //   featured: false,
  //   price: {
  //     monthly: 'R$ 199,90',
  //     quarterly: 'R$ 166,57',
  //     fullQuarterlyPrice: 'R$ 499,70',
  //   },
  //   description:
  //     'você quer ter acesso a todas as aulas gravadas e participar das aulas ao vivo',
  //   button: {
  //     label: 'escolher plano flow',
  //     href: 'https://app.yogacomkaka.com/register',
  //   },
  //   includedFeatures: [
  //     'acesso as aulas gratuitas da plataforma',
  //     'acesso a mais de 50 aulas exclusivas',
  //     'acesso a comunidade exclusiva',
  //     'acesso ao suporte exclusivo da kaká',
  //     'acesso as aulas ao vivo',
  //   ],
  //   excludedFeatures: [],
  // },
];

function Plan({
  name,
  code,
  // checkInsQuantityPerMonth,
  price,
  recurringButton,
  includedFeatures,
  excludedFeatures,
  activePeriod,
  featured = false,
  redirectToRecurringCheckout,
  isRedirectingToCheckout,
}: {
  name: string;
  code: PlanCode;
  checkInsQuantityPerMonth: number;
  price: {
    monthly: string;
    quarterly: string;
    fullQuarterlyPrice: string;
  };
  description: string;
  recurringButton: {
    label: string;
  };
  oneTimeButton: {
    label: string;
  };
  includedFeatures: Array<string>;
  excludedFeatures: Array<string>;
  activePeriod: BillingPeriod;
  logomarkClassName?: string;
  featured?: boolean;
  redirectToRecurringCheckout: ({
    planCode,
    billingPeriod,
  }: {
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }) => void;
  redirectToOneTimeCheckout: ({
    planCode,
    billingPeriod,
  }: {
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }) => void;
  isRedirectingToCheckout: boolean;
}) {
  return (
    <section
      className={clsx(
        'flex flex-col overflow-hidden rounded-3xl p-6 shadow-lg shadow-brand-purple-800/10',
        featured
          ? 'border-[1px] border-brand-purple-800 lg:order-none'
          : 'bg-white'
      )}
    >
      <div className="flex items-center justify-between gap-x-4">
        <h3
          className={clsx(
            'flex items-center text-lg font-semibold',
            featured ? 'text-brand-purple-800' : 'text-gray-900'
          )}
        >
          <span>{name}</span>
        </h3>
        {featured && activePeriod === 'quarterly' ? (
          <p className="rounded-full bg-brand-purple-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-brand-purple-600">
            mais popular
          </p>
        ) : null}
      </div>
      <p
        className={clsx(
          'relative mt-5 flex items-baseline text-3xl tracking-tight text-gray-700'
          // featured ? 'text-white' : 'text-gray-900'
        )}
      >
        <span
          aria-hidden={activePeriod === 'quarterly'}
          className={clsx(
            'transition duration-300',
            activePeriod === 'quarterly' &&
              'pointer-events-none translate-x-6 select-none opacity-0'
          )}
        >
          {price.monthly}
        </span>
        <span
          aria-hidden={activePeriod === 'monthly'}
          className={clsx(
            'absolute left-0 top-0 transition duration-300',
            activePeriod === 'monthly' &&
              'pointer-events-none -translate-x-6 select-none opacity-0'
          )}
        >
          {price.quarterly}
        </span>
        <span className="ml-1 text-sm font-semibold leading-6 tracking-normal text-gray-700">
          /mês
        </span>
      </p>
      <p
        className={clsx(
          'h-2 text-xs text-gray-700'
          // featured ? 'text-gray-100' : 'text-gray-700'
        )}
      >
        {activePeriod === 'quarterly' && (
          <span>
            (pagamento de {price.fullQuarterlyPrice} a cada trimestre)
          </span>
        )}
      </p>
      {/* <p
        className={clsx(
          'mt-3 text-sm text-gray-700'
          // featured ? 'text-gray-100' : 'text-gray-700'
        )}
      >
        {description}
      </p> */}
      <div className="mt-6">
        <PlanFeatures
          includedFeatures={includedFeatures}
          excludedFeatures={excludedFeatures}
        />
      </div>
      <Button
        onClick={() =>
          redirectToRecurringCheckout({
            planCode: code,
            billingPeriod: activePeriod,
          })
        }
        variant={featured ? 'default' : 'outline'}
        className="mt-6"
        aria-label={`Get started with the ${name} plan for ${price}`}
        disabled={isRedirectingToCheckout}
      >
        {recurringButton.label}
      </Button>
      {/* <Button
        onClick={() =>
          redirectToOneTimeCheckout({
            planCode: code,
            billingPeriod: activePeriod,
          })
        }
      >
        {oneTimeButton.label}
      </Button> */}
    </section>
  );
}

export function PlanFeatures({
  includedFeatures,
  excludedFeatures,
}: {
  includedFeatures: Array<string>;
  excludedFeatures: Array<string>;
}) {
  return (
    <ul
      className={clsx(
        '-my-2 divide-y divide-gray-200 text-sm text-gray-700'
        // featured
        //   ? 'divide-gray-700 text-gray-100'
        //   : 'divide-gray-200 text-gray-700'
      )}
    >
      {includedFeatures.map((feature) => (
        <li key={feature} className="flex py-2">
          <CheckCircle2
            className={clsx(
              'h-6 w-6 flex-none text-brand-purple-600'
              // featured ? 'text-white' : 'text-brand-purple-600'
            )}
          />
          <span className="ml-4">{feature}</span>
        </li>
      ))}
      {excludedFeatures.map((feature) => (
        <li key={feature} className="flex py-2">
          <XCircle className={clsx('h-6 w-6 flex-none text-red-300')} />
          <span className="ml-4">{feature}</span>
        </li>
      ))}
      {/* <li className="flex py-2">
            {checkInsQuantityPerMonth === 0 ? (
              <XCircle className={clsx('h-6 w-6 flex-none text-red-300')} />
            ) : (
              <CheckCircle2
                className={clsx(
                  'h-6 w-6 flex-none text-brand-purple-600'
                  // featured ? 'text-white' : 'text-brand-purple-600'
                )}
              />
            )}
            <span className="ml-4">
              <strong>{checkInsQuantityPerMonth}</strong> check-ins para aulas
              ao vivo
            </span>
          </li> */}
    </ul>
  );
}

export function ChoosePlan() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);

  const handleRedirectToRecurringCheckout = async ({
    planCode,
    billingPeriod,
  }: {
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }) => {
    setIsRedirectingToCheckout(true);

    try {
      const checkoutSessionResponse = await api.post<{ sessionId: string }>(
        '/users/checkout-session',
        {
          billingPeriod,
          planCode,
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
  };

  const handleRedirectToOneTimeCheckout = async ({
    planCode,
    billingPeriod,
  }: {
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }) => {
    setIsRedirectingToCheckout(true);

    try {
      const checkoutUrl = await api.post<{ checkoutUrl: string }>(
        '/mercadopago/checkout',
        {
          billingPeriod,
          planCode,
        }
      );

      window.location.href = checkoutUrl.data.checkoutUrl;
    } catch (err) {
      console.log(err);

      const { message } = convertErrorMessage({
        err,
      });

      errorToast({
        message,
      });
    } finally {
      setIsRedirectingToCheckout(false);
    }
  };

  return (
    <div>
      <div className="mt text-center">
        <div className="mt-8 flex justify-center">
          <div className="relative">
            <RadioGroup
              value={billingPeriod}
              onChange={setBillingPeriod}
              className="grid grid-cols-2"
            >
              {['monthly', 'quarterly'].map((period) => (
                <RadioGroup.Option
                  key={period}
                  value={period}
                  className={clsx(
                    'cursor-pointer border border-gray-300 px-[calc(theme(spacing.3)-1px)] py-[calc(theme(spacing.2)-1px)] text-center text-sm text-gray-700 outline-2 outline-offset-2 transition-colors hover:border-gray-400',
                    period === 'monthly'
                      ? 'rounded-l-lg'
                      : '-ml-px rounded-r-lg'
                  )}
                >
                  <span>{period === 'monthly' ? 'Mensal' : 'Trimestral'}</span>
                </RadioGroup.Option>
              ))}
            </RadioGroup>
            <div
              aria-hidden="true"
              className={clsx(
                'pointer-events-none absolute inset-0 z-10 grid grid-cols-2 overflow-hidden rounded-lg bg-brand-purple-600 transition-all duration-300',
                billingPeriod === 'monthly'
                  ? '[clip-path:inset(0_50%_0_0)]'
                  : '[clip-path:inset(0_0_0_calc(50%-1px))]'
              )}
            >
              {['monthly', 'quarterly'].map((period) => (
                <div
                  key={period}
                  className={clsx(
                    'py-2 text-center text-sm font-semibold text-white',
                    period === 'quarterly' && '-ml-px'
                  )}
                >
                  {period === 'monthly' ? 'Mensal' : 'Trimestral'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 grid max-w-lg grid-cols-1 flex-col-reverse items-start gap-x-8 gap-y-10 sm:mt-6 lg:max-w-none lg:grid-cols-1">
        {plans.map((plan) => (
          <Plan
            key={plan.name}
            {...plan}
            redirectToRecurringCheckout={handleRedirectToRecurringCheckout}
            redirectToOneTimeCheckout={handleRedirectToOneTimeCheckout}
            isRedirectingToCheckout={isRedirectingToCheckout}
            activePeriod={billingPeriod}
          />
        ))}
      </div>
    </div>
  );
}

export default function SubscribeModal({
  title = 'assinar plano - yoka club',
  ctaText = 'assinar plano',
  description = 'escolha o plano que melhor se adapta a você',
  CTAButton,
  className,
}: SubscribeModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {CTAButton ? (
        <CTAButton
          onClick={() => {
            setOpen(true);
          }}
          className={cn('mt-2 w-full', className)}
        >
          {ctaText}
        </CTAButton>
      ) : (
        <Button
          onClick={() => {
            setOpen(true);
          }}
          className={cn(
            'rounded px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm',
            className
          )}
        >
          {ctaText}
        </Button>
      )}
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                  <div className="mt text-center">
                    <Dialog.Title
                      as="h3"
                      className="mb-2 text-base font-semibold leading-6 text-purple-700"
                    >
                      {title}
                    </Dialog.Title>
                    {description && (
                      <Dialog.Description>
                        <p className="text-sm text-gray-600">{description}</p>
                      </Dialog.Description>
                    )}
                  </div>

                  <ChoosePlan />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
