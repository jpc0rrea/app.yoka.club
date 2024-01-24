import { Badge } from '@components/ui/badge';
import { FlameIcon } from 'lucide-react';

interface IntensityBadgeProps {
  intensity: string;
}

export default function IntensityBadge({ intensity }: IntensityBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`ml-2 min-w-max rounded-sm px-1 font-normal ${
        intensity === 'leve'
          ? 'bg-green-100 text-green-800 hover:bg-green-100'
          : intensity === 'moderado'
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
          : 'bg-red-100 text-red-800 hover:bg-red-100'
      }`}
    >
      <FlameIcon className="mr-1" size={12} />
      {/* {intensity === 'leve'
        ? '🔥 '
        : intensity === 'moderado'
        ? '🔥🔥 '
        : '🔥🔥🔥 '} */}
      {intensity}
    </Badge>
  );
}
