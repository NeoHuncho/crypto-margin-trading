import { AppShell } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import AccountActions from "~/components/dashboard/accountActions";
import AccountOverview from "~/components/dashboard/accountOverview";
import CoinsOverview from "~/components/dashboard/coinsOverview";
import Onboarding from "~/components/dashboard/onboarding";
import Header from "~/components/header/header";
import { api } from "~/utils/api";

export default function Dashboard() {
  const { data: sessionData, status } = useSession();
  const { data, isLoading, refetch } = api.user.getUserExchangeName.useQuery(
    { userId: sessionData?.user.id ?? "" },
    {
      enabled: !!sessionData,
    },
  );
  const router = useRouter();

  useEffect(() => {
    if (!sessionData && status !== "loading") {
      void router.push("/");
    }
  }, [sessionData, router, status]);

  const refetchData = () => {
    void refetch();
  };
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header />
      {!data?.exchangeName && !isLoading && (
        <Onboarding refetch={refetchData} />
      )}
      {data?.exchangeName && (
        <AppShell.Main>
          <div className="flex flex-col items-center justify-center gap-8 pt-2 ">
            <AccountOverview />
            <AccountActions />
            <CoinsOverview />
          </div>
        </AppShell.Main>
      )}
    </AppShell>
  );
}
