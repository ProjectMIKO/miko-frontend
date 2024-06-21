import { AppProps } from "next/app";
import { SocketProvider } from "./SocketContext";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  );
};

export default MyApp;
