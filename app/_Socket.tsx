import { AppProps } from "next/app";
import { SocketProvider } from "./components/Socket/SocketContext";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  );
};

export default MyApp;
