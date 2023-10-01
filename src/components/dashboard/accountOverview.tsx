import { Card } from "@mantine/core";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import TextAndLabel from "../common/textAndLabel";

export default function AccountOverview() {
  const { data: sessionData } = useSession();
  const { data: binanceAccountData } =
    api.binance.getBinanceAccountInformation.useQuery(
      { userId: sessionData?.user.id ?? "" },
      { enabled: !!sessionData?.user.id },
    );
  const { data: userData } = api.user.getUserStats.useQuery(
    { userId: sessionData?.user.id ?? "" },
    { enabled: !!sessionData?.user.id },
  );
  const { data: btcPrice } = api.binance.getCurrentBTCPrice.useQuery();
  if (!binanceAccountData || !userData || !btcPrice) return null;
  return (
    <Card className="w-fit">
      <h1 className="mb-6 text-center text-xl font-semibold">
        Account Overview
      </h1>
      <div className="grid grid-cols-4 gap-4">
        <TextAndLabel
          symbol="$"
          label={"Net Asset"}
          text={
            Number(binanceAccountData.totalNetAssetOfBtc) *
            Number(btcPrice?.price)
          }
        />
        <TextAndLabel
          label={"Risk Ratio"}
          text={binanceAccountData.marginLevel}
        />
        <TextAndLabel
          symbol="$"
          label={"To Invest"}
          text={
            Number(binanceAccountData.amountLeftToTradeBtc) *
            Number(btcPrice?.price)
          }
        />
        <TextAndLabel
          symbol="$"
          label={"Total Profit"}
          text={userData.totalEarnings}
        />
      </div>
    </Card>
  );
}
