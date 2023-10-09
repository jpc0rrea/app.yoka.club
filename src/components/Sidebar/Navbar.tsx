/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CalendarIcon,
  CreditCardIcon,
  LockClosedIcon,
  // UserIcon,
} from '@heroicons/react/24/outline';
import { classNames } from '@lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HistoryIcon, UsersIcon } from 'lucide-react';
import useUser from '@hooks/useUser';

export const navigationItems = [
  {
    name: 'calendário',
    href: '/',
    icon: CalendarIcon,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  {
    name: 'plano',
    href: '/billing',
    icon: CreditCardIcon,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  {
    name: 'extrato de check-ins',
    href: '/extract',
    icon: HistoryIcon,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  // {
  //   name: 'perfil',
  //   href: '/profile',
  //   icon: UserIcon,
  //   role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  // },
  {
    name: 'gerenciar eventos',
    href: '/events/manage',
    icon: LockClosedIcon,
    role: ['ADMIN', 'INSTRUCTOR'],
  },
  {
    name: 'gerenciar usuários',
    href: '/admin/users',
    icon: UsersIcon,
    role: ['ADMIN'],
  },
];

export default function Navbar() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <nav className="flex-1 space-y-1 py-2">
      {navigationItems
        .filter((item) => {
          return item.role.includes(user?.role || '');
        })
        .map((item) => {
          const isCurrent = router.pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                isCurrent
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
              )}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <item.icon
                className={classNames(
                  isCurrent
                    ? 'text-gray-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 h-6 w-6 flex-shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
    </nav>
  );
}
