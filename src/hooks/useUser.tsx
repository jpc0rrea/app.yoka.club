import { useRouter } from 'next/router';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { UserRole } from '@prisma/client';
import { api } from '@lib/api';
import convertErrorMessage from '@lib/error/convertErrorMessage';
import { errorToast } from '@components/Toast/ErrorToast';
import { successToast } from '@components/Toast/SuccessToast';
import { usePostHog } from 'posthog-js/react';

const userEndpoint = '/user';
const sessionEndpoint = '/sessions';
const publicRoutes = [
  '/login',
  '/register',
  '/register/confirm',
  '/register/activate',
  '/forgot-password',
  '/reset-password',
  '/service-terms',
  '/subscription-activation',
];
const refreshInterval = 600000; // 10 minutes

export interface UserInContext {
  id: string;
  name: string;
  displayName: string;
  email: string;
  imageUrl: string | null;
  username: string;
  bio: string;
  role: UserRole;
  checkInsQuantity: number;
  expirationDate: Date | null;
  isSubscribed: boolean;
}

export interface ErrorInUserContext {
  message: string;
  description?: string;
  action?: string;
}

export interface UserContextData {
  user: null | UserInContext;
  isLoading: boolean;
  error: ErrorInUserContext | undefined;
  fetchUser: () => Promise<{
    id: string;
    email: string;
  } | void>;
  logout: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext({
  user: null,
  isLoading: true,
  error: undefined,
} as UserContextData);

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserInContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<undefined | ErrorInUserContext>(undefined);
  const router = useRouter();
  const posthog = usePostHog();

  const fetchUser = useCallback(async () => {
    try {
      const fetchUserResponse = await api.get<{
        user: UserInContext | undefined;
        message: string | undefined;
        description: string | undefined;
        action: string | undefined;
      }>(userEndpoint);

      if (fetchUserResponse.status === 200 && fetchUserResponse.data.user) {
        const fetchedUser = fetchUserResponse.data.user;

        const cachedUserProperties = {
          id: fetchedUser.id,
          name: fetchedUser.name,
          displayName: fetchedUser.displayName,
          email: fetchedUser.email,
          imageUrl: fetchedUser.imageUrl,
          username: fetchedUser.username,
          bio: fetchedUser.bio,
          role: fetchedUser.role,
          checkInsQuantity: fetchedUser.checkInsQuantity,
          cacheTime: Date.now(),
        };

        posthog?.identify(fetchedUser.id, {
          email: fetchedUser.email,
        });

        setUser(fetchedUser);
        localStorage.setItem('user', JSON.stringify(cachedUserProperties));
        localStorage.removeItem('reloadTime');

        return {
          id: fetchedUser.id,
          email: fetchedUser.email,
        };
      }

      if (fetchUserResponse.status >= 400) {
        const { message, description, action } = fetchUserResponse.data;
        setError({
          message: message || 'Erro ao carregar usuário',
          description,
          action,
        });
      }
    } catch (err) {
      const { message, description } = convertErrorMessage({ err });
      setError({ message, description });

      errorToast({
        message,
        description,
      });
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [posthog]);

  useEffect(() => {
    // const storedUser = localStorage.getItem('user');

    if (
      publicRoutes.includes(router.pathname) ||
      router.pathname.startsWith('/register')
    ) {
      setIsLoading(false);
      return;
    }

    (async () => {
      if (isLoading && !isFetching) {
        // setUser(JSON.parse(storedUser));
        setIsFetching(true);
        await fetchUser();

        setIsFetching(false);
      }
      setIsLoading(false);
    })();

    if (isLoading) return;

    function onFocus() {
      const storedUser = localStorage.getItem('user');
      const cachedUser = JSON.parse(storedUser || '{}');
      setUser((user) =>
        cachedUser?.username ? { ...user, ...cachedUser } : null
      );
      if (refreshInterval < Date.now() - cachedUser?.cacheTime) fetchUser();
    }
    addEventListener('focus', onFocus);

    return () => removeEventListener('focus', onFocus);
  }, [fetchUser, isFetching, isLoading, router.pathname]);

  // useEffect(() => {
  //   if (
  //     !router ||
  //     publicRoutes.includes(router.pathname) ||
  //     router.pathname.startsWith('/register')
  //   )
  //     return;

  //   fetchUser();
  // }, [user, router, fetchUser]);

  const logout = useCallback(async () => {
    try {
      const clearSessionResponse = await api.delete(sessionEndpoint);

      if (clearSessionResponse.status === 200) {
        localStorage.clear();
        setUser(null);

        successToast({
          message: 'logout realizado com sucesso',
          description: 'até logo :)',
        });

        posthog?.capture('user_logged_out');

        router.push('/login');
      }
    } catch (err) {
      const { message, description } = convertErrorMessage({ err });

      errorToast({
        message,
        description,
      });
    }
  }, [router, posthog]);

  const userContextValue = {
    user,
    isLoading,
    error,
    fetchUser,
    logout,
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
}

export default function useUser() {
  return useContext(UserContext);
}
