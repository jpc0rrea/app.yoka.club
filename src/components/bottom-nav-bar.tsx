// components/BottomNavBar.tsx
import { Home, LucideIcon } from 'lucide-react';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { useSidebar } from '@hooks/useSidebar';
import { Button } from '@components/ui/button';
import { Fragment, SVGProps } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { classNames } from '@utils/classNames';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { LucideIcon as LucideIconType, HomeIcon, UserIcon } from 'lucide-react';
import useUser from '@hooks/useUser';
import yogaLiveColor from '../../public/images/icons/nav-bar/reshot-icon-bow-color.png';
import yogaLiveWhithoutColor from '../../public/images/icons/nav-bar/reshot-icon-bow-without-color.png';
import yogaRecordedColor from '../../public/images/icons/nav-bar/reshot-icon-triangle-color.png';
import yogaRecordedWhithoutColor from '../../public/images/icons/nav-bar/reshot-icon-triangle-without-color.png';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

type BottomNavBarItem = 'home' | 'live' | 'record';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon | StaticImageData;
  iconSelected?: LucideIcon | StaticImageData;
  customIcon?: boolean;
  href: string;
}

interface BottomNavBarProps {
  activeSection?: BottomNavBarItem;
}

interface UserNavigation {
  name: string;
  href: string;
  type: 'link' | 'button';
  icon:
    | ((
        props: SVGProps<SVGSVGElement> & {
          title?: string | undefined;
          titleId?: string | undefined;
        }
      ) => JSX.Element)
    | LucideIconType;
  onClick?: () => void;
}

// Custom Profile component for bottom nav bar
function BottomNavProfile() {
  const { logout, isLoading, user } = useUser();
  const userNavigation: UserNavigation[] = [
    {
      name: 'home',
      href: '/',
      type: 'link',
      icon: HomeIcon,
    },
    {
      name: user?.displayName || '',
      href: '/profile',
      type: 'link',
      icon: UserIcon,
    },
    {
      name: 'sair',
      href: '#',
      type: 'button',
      onClick: logout,
      icon: ArrowLeftOnRectangleIcon,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <img
            className="h-8 w-8 rounded-full"
            src={user.imageUrl || '/images/default-avatar.png'}
            alt=""
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-full right-0 z-50 mb-2 w-48 origin-bottom-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {userNavigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) =>
                item.type === 'button' ? (
                  <Button
                    variant={`secondary`}
                    onClick={item.onClick}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'flex w-full justify-start rounded-none bg-white px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        active
                          ? 'text-gray-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 h-5 w-5 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Button>
                ) : (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'flex px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        active
                          ? 'text-gray-500'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 h-5 w-5 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                )
              }
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export const BottomNavBar = ({ activeSection }: BottomNavBarProps) => {
  const { setIsSidebarOpen } = useSidebar();

  const navItems: NavItem[] = [
    { id: 'home', label: 'início', icon: Home, href: '/' },
    {
      id: 'live',
      label: 'ao vivo',
      icon: yogaLiveWhithoutColor,
      iconSelected: yogaLiveColor,
      customIcon: true,
      href: '/live-classes',
    },
    {
      id: 'record',
      label: 'gravadas',
      icon: yogaRecordedWhithoutColor,
      iconSelected: yogaRecordedColor,
      customIcon: true,
      href: '/recorded-classes',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg md:hidden">
      <div className="grid grid-cols-5 items-center">
        {/* Sidebar Button - First item on the left */}
        <div className="flex justify-center py-2">
          <Button
            variant={`icon`}
            type="button"
            className="h-full rounded-none px-4 text-gray-500 focus:outline-none md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
          </Button>
        </div>

        {/* Navigation Items - Center items */}
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 text-sm transition-colors duration-300
                ${
                  isActive
                    ? 'text-purple-800'
                    : 'text-gray-600 hover:text-purple-800'
                }`}
              aria-label={item.label}
            >
              {item.customIcon ? (
                <Image
                  src={
                    (isActive
                      ? item.iconSelected
                      : item.icon) as StaticImageData
                  }
                  alt={item.label}
                  width={24}
                  height={24}
                />
              ) : (
                // @ts-expect-error - This is actually a valid Lucide icon
                <item.icon size={24} />
              )}
              <span className="mt-1 text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Profile - Last item on the right */}
        <div className="flex justify-center py-2">
          <div className="flex flex-col items-center justify-center">
            <BottomNavProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};
