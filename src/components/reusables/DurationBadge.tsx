import { Badge } from '@components/ui/badge';
import { TimerIcon } from 'lucide-react';

interface DurationBadgeProps {
  duration: number;
  style?: 'default' | 'simple';
}

export default function DurationBadge({
  duration,
  style = 'default',
}: DurationBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`min-w-max rounded-sm px-1 font-normal ${
        style === 'simple' ? 'text-[8px]' : ''
      }`}
    >
      <TimerIcon className="mr-1" size={style === 'default' ? 12 : 10} />
      {duration} minutos
    </Badge>
  );
}
