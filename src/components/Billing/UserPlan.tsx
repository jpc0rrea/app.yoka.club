import { useUserPlan } from '@hooks/useUserPlan';
import { Loader2 } from 'lucide-react';
import FreePlan from './free-plan';
import ZenPlan from './zen-plan';

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

      {isLoading || !userPlan ? (
        <div className="mt-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : userPlan.type === 'free' || !userPlan.expirationDate ? (
        <FreePlan />
      ) : (
        <ZenPlan
          name={userPlan.name}
          expirationDate={userPlan.expirationDate}
          nextBillingDate={userPlan.nextBillingDate}
          nextBillingValue={userPlan.nextBillingValue}
          cancelAtPeriodEnd={userPlan.cancelAtPeriodEnd}
          hasSubscription={!!userPlan.stripeSubscriptionId}
        />
      )}
    </div>
  );
}
