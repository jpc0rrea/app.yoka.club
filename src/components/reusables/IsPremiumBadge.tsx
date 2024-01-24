import { Badge } from '@components/ui/badge';
import { CheckIcon, SparklesIcon } from 'lucide-react';

interface IsPremiumBadgeProps {
  isPremium: boolean;
}

export default function IsPremiumBadge({ isPremium }: IsPremiumBadgeProps) {
  return (
    <Badge
      variant={isPremium ? 'default' : 'secondary'}
      className={`ml-2 min-w-max rounded-sm px-1 font-normal ${
        isPremium
          ? 'bg-brand-purple-100 text-brand-purple-800 hover:bg-brand-purple-100'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      }'}`}
    >
      {isPremium ? (
        <SparklesIcon className="mr-1" size={12} />
      ) : (
        <CheckIcon className="mr-1" size={12} />
      )}
      {/* {intensity === 'leve'
        ? '🔥 '
        : intensity === 'moderado'
        ? '🔥🔥 '
        : '🔥🔥🔥 '} */}
      {isPremium ? 'exclusiva' : 'gratuita'}
    </Badge>
  );
}
