import { Badge } from '@components/ui/badge';
import { CheckIcon } from 'lucide-react';

interface CheckedInBadgeProps {
  hasCheckedIn: boolean;
}

export default function CheckedInBadge({ hasCheckedIn }: CheckedInBadgeProps) {
  if (!hasCheckedIn) {
    return null;
  }

  return (
    <Badge
      variant="default"
      className="min-w-max rounded-sm bg-green-100 px-1 font-normal text-green-800 hover:bg-green-100"
    >
      <CheckIcon className="mr-1" size={12} />
      check-in
    </Badge>
  );
}
