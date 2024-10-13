import { createGetInitialProps } from '@mantine/next';
import { ColorSchemeScript } from '@mantine/core';
import Document, { Head, Html, Main, NextScript } from 'next/document';

const getInitialProps = createGetInitialProps();

export default class MyDocument extends Document {
  static getInitialProps = getInitialProps;

  render() {
    return (
      <Html className="h-full scroll-smooth bg-gray-50">
        <Head>
          <ColorSchemeScript defaultColorScheme="auto" />
          {/* <!-- Google Tag Manager --> */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-56PQXGHL');`,
            }}
          ></script>
          {/* <!-- End Google Tag Manager --> */}
          <meta
            name="description"
            content="yoka club, seu clube de saúde e bem estar"
          />
          <meta
            property="og:description"
            content="yoka club, seu clube de saúde e bem estar"
          />
          <meta property="og:title" content="yoga com kaká" />
          <meta property="title" content="yoga com kaká" />
          <meta property="og:image" content="/preview.jpeg" />
          <meta property="og:image:width" content="625" />
          <meta property="og:image:height" content="632" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
          <link
            href="https://fonts.googleapis.com/css2?family=Be+Vietnam:wght@100;300;400;500;600;700;800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap"
            rel="stylesheet"
          />
          {/* Updated favicon section */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />

          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="title" content="turma de yoga online" />
          <meta name="description" content="turma de yoga online" />
        </Head>
        <body className="h-full">
          {/* <!-- Google Tag Manager --> */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-56PQXGHL');`,
            }}
          ></script>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-56PQXGHL"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="gtag manager"
            ></iframe>
          </noscript>
          {/* <!-- End Google Tag Manager --> */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
