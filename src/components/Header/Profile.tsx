import { Fragment, SVGProps } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { classNames } from '@utils/classNames';
// import { UserIcon } from '@heroicons/react/20/solid';
import {
  ArrowLeftOnRectangleIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import useUser from '@hooks/useUser';

interface UserNavigation {
  name: string;
  href: string;
  type: 'link' | 'button';
  icon: (
    props: SVGProps<SVGSVGElement> & {
      title?: string | undefined;
      titleId?: string | undefined;
    }
  ) => JSX.Element;
  onClick?: () => void;
}

export default function Profile() {
  const { logout, isLoading, user } = useUser();
  const userNavigation: UserNavigation[] = [
    // { name: 'perfil', href: '/profile', type: 'link', icon: UserIcon },
    {
      name: user?.displayName || '',
      href: '/',
      type: 'link',
      icon: HomeIcon,
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
        <div className="flex h-full animate-pulse">
          <div className="my-auto h-8 w-8 rounded-full bg-gray-400"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 w-3/4 rounded bg-gray-400"></div>
            <div className="space-y-2">
              <div className="h-4 rounded bg-gray-400"></div>
              <div className="h-4 w-5/6 rounded bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <img
            className="h-8 w-8 rounded-full"
            src={user.imageUrl || '/images/default-avatar.png'}
            alt=""
          />
          {/* {user.imageUrl ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.imageUrl || '/images/default-avatar.png'}
              alt=""
            />
          ) : (
            <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100">
              <svg
                className="h-full w-full text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          )} */}
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {userNavigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) =>
                item.type === 'button' ? (
                  <button
                    onClick={item.onClick}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'flex w-full px-4 py-2 text-sm text-gray-700'
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
                  </button>
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
