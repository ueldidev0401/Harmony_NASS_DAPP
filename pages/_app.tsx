import "styles/global.scss"; // Global styles
import StateProvider from "state"; // Global state provider
import type { AppProps } from "next/app"; // Types
import Layout from "../components/Layout"
import { useState } from "react" // State management
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Meta from "components/Meta";

// Export application
export default function MyApp({
  Component,
  pageProps,
}: AppProps) {
  const [darkMode, setDarkMode] = useState(false)
  return (
    <StateProvider>
      <Meta />
      <Layout setDarkMode={setDarkMode} darkMode={darkMode}>
        <Component {...pageProps} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          theme={darkMode?"dark":"light"}
        />
      </Layout>
    </StateProvider>
  );
}
