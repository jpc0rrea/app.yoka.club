import useUser from '@hooks/useUser';
import { Separator } from './ui/separator';

export default function Greeting() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <h2 className="text-xl font-semibold tracking-tight">
      oie, {user.displayName} 👋🏽
    </h2>
  );
}
