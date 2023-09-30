import { Button, Title } from "@mantine/core";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { data: sessionData } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionData) {
      void router.push("/dashboard");
    }
  }, [sessionData, router]);

  return (
    <>
      <Head>
        <title>Crypto Margin Trading</title>
        <meta
          name="description"
          content="Make money with this powerful crypto margin trading bot"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Title className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Crypto <span className="text-[hsl(280,100%,70%)]">Margin</span>{" "}
            Trading
          </Title>
          <div>
            <Button
              variant="filled"
              size="lg"
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "Sign out" : "Sign in"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
