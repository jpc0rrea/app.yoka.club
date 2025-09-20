import { type AppType } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import '../styles/globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { SidebarProvider } from '@contexts/SidebarContext';
import { queryClient } from '@lib/queryClient';
import { UserProvider } from '@hooks/useUser';
import theme from '@styles/mantine/theme';
import Head from 'next/head';
import FacebookPixel from '@components/FacebookPixel';
import { useEffect, useRef } from 'react';
import { trackPageView } from '@utils/facebook-tracking';
import { useRouter } from 'next/router';

dayjs.extend(customParseFormat);

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  const router = useRouter();

  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  if (typeof window !== 'undefined') {
    // checks that we are client-side
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          // debug mode in development
          posthog.debug();
        }
      },
      autocapture: false,
    });
  }

  // Ensure PageView is sent once per route, avoiding double fire in React Strict Mode
  const hasTrackedInitialRef = useRef(false);
  useEffect(() => {
    if (!hasTrackedInitialRef.current) {
      hasTrackedInitialRef.current = true;
      // Fire one Conversion API PageView per load (includes fbq when available)
      trackPageView();
    }

    const handleRouteChange = () => {
      trackPageView();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>yoka club</title>
      </Head>
      {facebookPixelId && <FacebookPixel pixelId={facebookPixelId} />}
      <PostHogProvider client={posthog}>
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
      </PostHogProvider>
    </>
  );
};

export default MyApp;
