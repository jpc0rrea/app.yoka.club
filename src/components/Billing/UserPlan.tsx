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

// const userPlan = {
//   id: 'free',
//   name: 'gratuito',
//   checkinsQuantity: 0,
//   price: 0,
//   extra: 'acesso aos conteúdos gratuitos',
//   expirationDate: undefined,
//   nextBillingDate: undefined,
// };

const userPlan = {
  id: 'newbie',
  name: 'yogi iniciante',
  checkinsQuantity: 8,
  price: 199.9,
  extra: 'acesso a conteúdos exclusivos',
  expirationDate: new Date(2023, 6, 15),
  nextBillingDate: new Date(2023, 6, 13, 12, 0, 0),
};

export default function UserPlan() {
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
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              plano {userPlan.name}
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
                    {format(userPlan.expirationDate, "dd/MM/yyyy' às 'HH:mm")}
                  </strong>
                </p>
              </div>
            )}

            {userPlan.nextBillingDate && (
              <div className="mt-2 flex items-center">
                <CreditCardIcon className="inline-block h-5 w-5 text-purple-800" />

                <p className="ml-1 text-sm text-gray-700">
                  próximo pagamento será dia{' '}
                  <strong className="text-purple-800">
                    {format(userPlan.nextBillingDate, "dd/MM/yyyy' às 'HH:mm")}{' '}
                  </strong>
                  no valor de{' '}
                  <strong className="text-purple-800">
                    {convertNumberToReal(userPlan.price)}
                  </strong>
                </p>
              </div>
            )}

            <div className="mt-4">
              {userPlan.id === 'free' && <SubscribeModal />}
              {userPlan.nextBillingDate && userPlan.expirationDate && (
                <CancelSubscriptionModal
                  expirationDate={userPlan.expirationDate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
