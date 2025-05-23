// components/BottomNavBar.tsx
import { Home, LucideIcon } from 'lucide-react';
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
  activeSection: BottomNavBarItem;
}

export const BottomNavBar = ({ activeSection }: BottomNavBarProps) => {
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden">
      <div className="mx-14 grid grid-cols-3">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-end py-2 text-sm transition-colors duration-300
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
                  width={32}
                  height={32}
                />
              ) : (
                // @ts-expect-error - This is actually a valid Lucide icon
                <item.icon size={24} />
              )}
              <span className="mt-1 text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
