import SubscribeModal from '../Modals/SubscribeModal';

export default function FreePlan() {
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm text-red-500">
        você não possui um plano ativo :(
      </p>
      <SubscribeModal ctaText="assinar plano" />
    </div>
  );
}
