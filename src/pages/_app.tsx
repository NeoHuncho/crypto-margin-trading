import { MantineProvider, createTheme } from "@mantine/core";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";

import "@mantine/core/styles.css";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const theme = createTheme({
    /** Put your mantine theme override here */
  });
  return (
    <SessionProvider session={session}>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <Component {...pageProps} />
      </MantineProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
