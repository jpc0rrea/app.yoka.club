import { type AppType } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';

import '../styles/globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { SidebarProvider } from '@contexts/SidebarContext';
import { queryClient } from '@lib/queryClient';
import { UserProvider } from '@hooks/useUser';
import theme from '@styles/mantine/theme';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    <MantineProvider theme={theme}>
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
