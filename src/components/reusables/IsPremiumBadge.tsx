import { Badge } from '@components/ui/badge';
import { CheckIcon, SparklesIcon } from 'lucide-react';

interface IsPremiumBadgeProps {
  isPremium: boolean;
  style?: 'default' | 'simple';
}

export default function IsPremiumBadge({
  isPremium,
  style = 'default',
}: IsPremiumBadgeProps) {
  return (
    <Badge
      variant={isPremium ? 'default' : 'secondary'}
      className={`min-w-max rounded-sm px-1 font-normal ${
        isPremium
          ? 'bg-brand-purple-100 text-brand-purple-800 hover:bg-brand-purple-100'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      } ${style === 'simple' ? 'text-[8px]' : ''}`}
    >
      {isPremium ? (
        <SparklesIcon className="mr-1" size={style === 'default' ? 12 : 10} />
      ) : (
        <CheckIcon className="mr-1" size={style === 'default' ? 12 : 10} />
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
