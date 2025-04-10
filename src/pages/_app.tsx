import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Páginas que no deben tener el Layout ni el Navbar
  const noLayoutPages = ['/login', '/register'];
  const shouldUseLayout = !noLayoutPages.includes(router.pathname);
  
  return (
    <>
      {shouldUseLayout && <Navbar />}
      {shouldUseLayout ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}
