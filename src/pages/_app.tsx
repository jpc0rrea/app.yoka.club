import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';

import '../styles/globals.css';
import { SidebarProvider } from '@contexts/SidebarContext';
import { queryClient } from '@lib/queryClient';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <MantineProvider
      theme={{
        /** Put your mantine theme override here */
        colorScheme: 'light',
        primaryColor: 'brand-purple',
        colors: {
          'brand-purple': [
            '#fbf2ff',
            '#f6e2ff',
            '#eecaff',
            '#e1a1ff',
            '#d166ff',
            '#c02cff',
            '#b005ff',
            '#9c00f9',
            '#8400ca',
            '#660198',
          ],
        },
      }}
    >
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </SessionProvider>
    </MantineProvider>
  );
};

export default MyApp;
