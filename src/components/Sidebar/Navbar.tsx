/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { classNames } from '@lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Lock,
  HomeIcon,
  UsersIcon,
  UserIcon,
  CreditCardIcon,
  PlayCircleIcon,
  RocketIcon,
  MousePointerClick,
  LucideIcon,
  FlagTriangleRight,
} from 'lucide-react';
import useUser from '@hooks/useUser';
import yogaLiveColor from '../../../public/images/icons/nav-bar/reshot-icon-bow-color.png';
import yogaLiveWhithoutColor from '../../../public/images/icons/nav-bar/reshot-icon-bow-without-color.png';
import yogaRecordedColor from '../../../public/images/icons/nav-bar/reshot-icon-triangle-color.png';
import yogaRecordedWhithoutColor from '../../../public/images/icons/nav-bar/reshot-icon-triangle-without-color.png';
import yogaTrailsColor from '../../../public/images/icons/nav-bar/reshot-icon-cobra-color.png';
import yogaTrailsWhithoutColor from '../../../public/images/icons/nav-bar/reshot-icon-cobra-without-color.png';
import Image, { StaticImageData } from 'next/image';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon | StaticImageData;
  iconSelected?: LucideIcon | StaticImageData;
  customIcon?: boolean;
  role: string[];
}

export const navigationItems: NavigationItem[] = [
  {
    name: 'início',
    href: '/',
    icon: HomeIcon,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  {
    name: 'trilhas',
    href: '/trails',
    icon: yogaTrailsWhithoutColor,
    iconSelected: yogaTrailsColor,
    customIcon: true,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  {
    name: 'aulas ao vivo',
    href: '/live-classes',
    icon: yogaLiveWhithoutColor,
    iconSelected: yogaLiveColor,
    customIcon: true,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  {
    name: 'aulas gravadas',
    href: '/recorded-classes',
    icon: yogaRecordedWhithoutColor,
    iconSelected: yogaRecordedColor,
    customIcon: true,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  {
    name: 'perfil',
    href: '/profile',
    icon: UserIcon,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  // {
  //   name: 'extrato de check-ins',
  //   href: '/extract',
  //   icon: HistoryIcon,
  //   role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  // },
  {
    name: 'plano',
    href: '/billing',
    icon: CreditCardIcon,
    role: ['ADMIN', 'USER', 'INSTRUCTOR'],
  },
  {
    name: 'eventos',
    href: '/events/manage',
    icon: Lock,
    role: ['ADMIN', 'INSTRUCTOR'],
  },
  {
    name: 'usuários',
    href: '/admin/users',
    icon: UsersIcon,
    role: ['ADMIN'],
  },
  {
    name: 'recomendações',
    href: '/admin/recommendations',
    icon: MousePointerClick,
    role: ['ADMIN'],
  },
  {
    name: 'business',
    href: '/admin/business',
    icon: RocketIcon,
    role: ['ADMIN'],
  },
  {
    name: 'trilha admin',
    href: '/admin/trails',
    icon: FlagTriangleRight,
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
              {item.customIcon ? (
                <Image
                  src={
                    (isCurrent
                      ? item.iconSelected
                      : item.icon) as StaticImageData
                  }
                  alt={item.name}
                  width={32}
                  height={32}
                  className="mr-3 h-8 w-8 min-w-8 flex-shrink-0"
                />
              ) : (
                // @ts-expect-error - This is actually a valid Lucide icon
                <item.icon
                  className={classNames(
                    'black min-w-8 justify-start font-extrabold group-hover:text-gray-500',
                    'mr-3 h-7 w-7 flex-shrink-0'
                  )}
                  aria-hidden="true"
                  strokeWidth={1}
                />
              )}
              {item.name}
            </Link>
          );
        })}
    </nav>
  );
}
