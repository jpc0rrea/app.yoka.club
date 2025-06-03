import { TrailFromAPI } from '@models/trails/types';
import { Loader2 } from 'lucide-react';
import TrailInManageSection from './TrailInManageSection';
import useUser from '@hooks/useUser';

interface TrailsSectionProps {
  trails?: TrailFromAPI[];
  isLoading: boolean;
}

export default function TrailsSection({
  trails,
  isLoading,
}: TrailsSectionProps) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  if (user.role !== 'ADMIN') {
    return null;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {!trails || isLoading ? (
        <Loader2 className="mr-2 mt-4 h-4 w-4 animate-spin" />
      ) : trails.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">nenhuma trilha encontrada</p>
      ) : (
        trails.map((trail) => {
          return <TrailInManageSection key={trail.id} trail={trail} />;
        })
      )}
    </ul>
  );
}
