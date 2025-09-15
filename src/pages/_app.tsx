import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";
import { DownloadProvider } from "~/contexts/DownloadContext";
import { DownloadProgressWidget } from "~/components/ui/DownloadProgressWidget";

import "~/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DownloadProvider>
        <div className={geist.className}>
          <Component {...pageProps} />
          <DownloadProgressWidget />
        </div>
      </DownloadProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
