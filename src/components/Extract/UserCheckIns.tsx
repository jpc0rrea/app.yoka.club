import { CheckCircleIcon } from '@heroicons/react/24/outline';
import BuyMoreCheckIns from '@components/Modals/BuyMoreCheckIns';

export default function UserCheckIns() {
  return (
    <div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          extrato de check-ins
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          área para visualizar seus check-ins
        </p>
      </div>

      <div className="mt-6">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="inline-block h-6 w-6 text-purple-800" />
              <p className="ml-1 text-gray-900">
                <strong className="text-purple-800">6</strong> check-ins
                restantes
              </p>
            </div>
            <p className="text-sm text-gray-500">
              fique tranquilo, seus check-ins não expiram :)
            </p>

            <div className="mt-4">
              <BuyMoreCheckIns />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
