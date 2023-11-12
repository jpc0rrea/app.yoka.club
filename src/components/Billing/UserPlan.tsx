import CancelSubscriptionModal from '@components/Modals/CancelSubscriptionModal';
import {
  ArrowPathIcon,
  CalendarIcon,
  CreditCardIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { convertNumberToReal } from '@lib/utils';
import { format } from 'date-fns';
import SubscribeModal from '../Modals/SubscribeModal';
import { useUserPlan } from '@hooks/useUserPlan';
import { Loader2 } from 'lucide-react';

// const userPlan = {
//   id: 'free',
//   name: 'gratuito',
//   checkinsQuantity: 0,
//   price: 0,
//   extra: 'acesso aos conteúdos gratuitos',
//   expirationDate: undefined,
//   nextBillingDate: undefined,
// };

// const userPlan = {
//   id: 'newbie',
//   name: 'yogi iniciante',
//   checkinsQuantity: 8,
//   price: 199.9,
//   extra: 'acesso a conteúdos exclusivos',
//   expirationDate: new Date(2023, 6, 15),
//   nextBillingDate: new Date(2023, 6, 13, 12, 0, 0),
// };

export default function UserPlan() {
  const { data: userPlan, isLoading } = useUserPlan();

  return (
    <div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          seu plano
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          informações sobre seu plano atual
        </p>
      </div>

      <div className="mt-6">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          {!userPlan || isLoading ? (
            <div className="p-6">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                plano {userPlan.name}
                {userPlan.type === 'premium' && userPlan.cancelAtPeriodEnd && (
                  <span className="ml-2 inline-flex items-center rounded-md bg-red-50 px-1 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    cancelado
                  </span>
                )}
              </h3>
              {/* <div className="my-4 flex items-center">
              <CheckCircleIcon className="inline-block h-5 w-5 text-purple-800" />
              <p className="ml-1 text-sm text-gray-700">
                <strong className="text-purple-800">6</strong> check-ins
                restantes
              </p>
              <button className="ml-1 inline-flex justify-center rounded-md border border-transparent bg-purple-800 py-1 px-2 text-xs font-medium text-white shadow-sm hover:bg-purple-900">
                comprar mais
              </button>
            </div> */}

              <div className="mt-4 flex items-center">
                <ArrowPathIcon className="inline-block h-5 w-5 text-purple-800" />

                <p className="ml-1 text-sm text-gray-700">
                  <strong className="text-purple-800">
                    {userPlan.checkinsQuantity}
                  </strong>{' '}
                  check-ins por mês
                </p>
              </div>
              <div className="mt-2 flex items-center">
                <SparklesIcon className="inline-block h-5 w-5 text-purple-800" />

                <p className="ml-1 text-sm font-bold text-purple-800">
                  {userPlan.extra}
                </p>
              </div>
              {userPlan.expirationDate && (
                <div className="mt-2 flex items-center">
                  <CalendarIcon className="inline-block h-5 w-5 text-purple-800" />

                  <p className="ml-1 text-sm text-gray-700">
                    plano expira em{' '}
                    <strong className="text-purple-800">
                      {format(
                        new Date(userPlan.expirationDate),
                        "dd/MM/yyyy' às 'HH:mm"
                      )}
                    </strong>
                  </p>
                </div>
              )}

              {userPlan.nextBillingDate && !userPlan.cancelAtPeriodEnd && (
                <div className="mt-2 flex items-center">
                  <CreditCardIcon className="inline-block h-5 w-5 text-purple-800" />

                  <p className="ml-1 text-sm text-gray-700">
                    próximo pagamento será dia{' '}
                    <strong className="text-purple-800">
                      {format(
                        new Date(userPlan.nextBillingDate),
                        "dd/MM/yyyy' às 'HH:mm"
                      )}{' '}
                    </strong>
                    no valor de{' '}
                    <strong className="text-purple-800">
                      {userPlan.nextBillingValue ||
                        convertNumberToReal(userPlan.price)}
                    </strong>
                  </p>
                </div>
              )}

              <div className="mt-4">
                {(userPlan.id === 'FREE' || userPlan.cancelAtPeriodEnd) && (
                  <SubscribeModal label="ver opções de plano" />
                )}
                {userPlan.nextBillingDate &&
                  userPlan.expirationDate &&
                  !userPlan.cancelAtPeriodEnd && (
                    <CancelSubscriptionModal
                      expirationDate={userPlan.expirationDate}
                    />
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
