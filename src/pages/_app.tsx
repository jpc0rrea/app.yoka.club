import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

import '../styles/globals.css';
import { SidebarProvider } from '@contexts/SidebarContext';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <Toaster
          toastOptions={{
            duration: 4000,
            position: 'top-right',
            style: {
              padding: '0px',
            },
          }}
        />

        <Component {...pageProps} />
      </SidebarProvider>
    </SessionProvider>
  );
};

export default MyApp;
