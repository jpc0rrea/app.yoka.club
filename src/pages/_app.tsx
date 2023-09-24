import { type AppType } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';

import '../styles/globals.css';
import { SidebarProvider } from '@contexts/SidebarContext';
import { queryClient } from '@lib/queryClient';
import { UserProvider } from '@hooks/useUser';

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
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
      <UserProvider>
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
      </UserProvider>
    </MantineProvider>
  );
};

export default MyApp;
