import "../styles/globals.css";
import Head from "next/head";
import { LanguageProvider } from "../lib/useLanguage";

export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Head>
        <title>Mobile Data Packages | InternetKudo Style</title>
        <meta
          name="description"
          content="Buy flexible high-speed mobile data packages with instant activation and global coverage."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Mobile Data Packages" />
        <meta
          property="og:description"
          content="Flexible mobile data plans with instant activation and wide coverage."
        />
      </Head>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}


