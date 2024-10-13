import { CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import CancelSubscriptionModal from '@components/Modals/CancelSubscriptionModal';
import SubscribeModal from '../Modals/SubscribeModal';
import { Sparkles } from 'lucide-react';
import ReactivateSubscriptionModal from '@components/Modals/ReactivateSubscriptionModal';

interface ZenPlanProps {
  name: string;
  expirationDate: Date;
  hasSubscription: boolean;
  nextBillingDate?: Date;
  nextBillingValue?: string;
  cancelAtPeriodEnd: boolean;
}

export default function ZenPlan({
  name,
  expirationDate,
  nextBillingDate,
  nextBillingValue,
  hasSubscription,
  cancelAtPeriodEnd,
}: ZenPlanProps) {
  return (
    <div className="mt-6">
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <div className="flex items-center text-brand-yoka-purple-700">
            <Sparkles className="h-4 w-4 " />
            <h3 className="` leading ml-2 text-lg font-medium">
              {name}
              {cancelAtPeriodEnd && (
                <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-1 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                  cancelado
                </span>
              )}
            </h3>
          </div>

          <div className="mt-2 flex items-center">
            <CalendarIcon className="inline-block h-5 w-5 text-brand-yoka-purple-700" />
            <p className="ml-1 text-sm text-gray-700">
              plano expira em{' '}
              <strong className="text-brand-yoka-purple-700">
                {format(new Date(expirationDate), "dd/MM/yyyy' às 'HH:mm")}
              </strong>
            </p>
          </div>

          {nextBillingDate && !cancelAtPeriodEnd && (
            <div className="mt-2 flex items-center">
              <CreditCardIcon className="inline-block h-5 w-5 text-brand-yoka-purple-700" />
              <p className="ml-1 text-sm text-gray-700">
                próximo pagamento será dia{' '}
                <strong className="text-brand-yoka-purple-700">
                  {format(new Date(nextBillingDate), "dd/MM/yyyy' às 'HH:mm")}{' '}
                </strong>
                no valor de{' '}
                <strong className="text-brand-yoka-purple-700">
                  {nextBillingValue}
                </strong>
              </p>
            </div>
          )}

          <div className="mt-4">
            {!hasSubscription ? (
              <div className="flex flex-col items-start justify-center">
                <p className="mb-2 text-left text-sm text-gray-700">
                  ops, você <strong>não possui uma assinatura ativa.</strong>
                  <br /> para não perder o acesso aos conteúdos exclusivos,{' '}
                  <strong>assine o plano :)</strong>
                </p>
                <SubscribeModal ctaText="assinar" />
              </div>
            ) : cancelAtPeriodEnd ? (
              <ReactivateSubscriptionModal />
            ) : (
              <CancelSubscriptionModal expirationDate={expirationDate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
