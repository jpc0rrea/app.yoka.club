import { Badge } from '@components/ui/badge';
import { TimerIcon } from 'lucide-react';

interface DurationBadgeProps {
  duration: number;
}

export default function DurationBadge({ duration }: DurationBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="min-w-max rounded-sm px-1 font-normal"
    >
      <TimerIcon className="mr-1" size={12} />
      {duration} minutos
    </Badge>
  );
}
