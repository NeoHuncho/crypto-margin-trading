import { Card, CardBody, Input } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Icon } from "~/assets/icons";
import { api } from "~/utils/api";

function AddNewCoinCard({ refetchCoins }: { refetchCoins: () => void }) {
  const { data: sessionData } = useSession();
  const { data: binanceAccountData } =
    api.binance.getBinanceAccountInformation.useQuery(
      { userId: sessionData?.user.id ?? "" },
      { enabled: !!sessionData?.user.id },
    );
  const createUserCoin = api.user.createUserCoin.useMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [coinName, setCoinName] = useState("");

  const findMatchingCoins = (coinName: string) =>
    binanceAccountData?.userAssets.filter((coin) =>
      coin.asset.includes(coinName.toLocaleUpperCase()),
    );

  const createCoin = async (name: string) => {
    await createUserCoin.mutateAsync({
      userId: sessionData?.user.id ?? "",
      name,
    });
    setCoinName("");
    refetchCoins();
  };

  if (!binanceAccountData) return null;
  return (
    <Card className="cursor-pointer">
      <CardBody>
        <div
          onClick={() => setIsAdding(true)}
          className="flex flex-col"
          style={{ minHeight: 100 }}
        >
          {!isAdding ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Icon
                name="CirclePlus"
                size={30}
                className="text-gray-700 dark:text-gray-200"
              />
              <p className="text-lg font-semibold">Add New Coin</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Coin symbol (ex: BTC)"
                value={coinName}
                onValueChange={setCoinName}
              />
              <div>
                <p className="mb-4 text-center text-sm italic">
                  choose from available coins for margin trading
                </p>
                <div className="flex flex-col gap-2">
                  {coinName &&
                    findMatchingCoins(coinName)
                      ?.map((coin) => (
                        <p
                          key={coin.asset}
                          className="text-sm"
                          onClick={() => void createCoin(coin.asset)}
                        >
                          {coin.asset}
                        </p>
                      ))
                      .slice(0, 5)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default function CoinsOverview() {
  const { data: sessionData } = useSession();
  const { data: userCoins, refetch } = api.user.getUserCoins.useQuery(
    { userId: sessionData?.user.id ?? "" },
    { enabled: !!sessionData?.user.id },
  );
  const deleteUserCoin = api.user.deleteUserCoin.useMutation();

  const refetchCoins = () => void refetch();
  const deleteCoin = async (name: string) => {
    await deleteUserCoin.mutateAsync({
      userId: sessionData?.user.id ?? "",
      name,
    });
    refetchCoins();
  };

  return (
    <div className="grid w-full grid-cols-6 gap-6 px-4 dark">
      {userCoins?.map((coin) => (
        <Card key={coin.name}>
          <CardBody>
            <div className="flex flex-col gap-2">
              <Icon
                name="Trash"
                size={15}
                onClick={() => void deleteCoin(coin.name)}
                className="absolute right-6 top-4 cursor-pointer text-gray-700 dark:text-gray-200"
              />
              <p className="text-center text-lg font-semibold">{coin.name}</p>
              <div className="flex flex-col gap-2">
                {/* <p className="text-sm">Total Trades: {coin.name}</p>
                <p className="text-sm">Total Profit: {coin.profitLoss}$</p> */}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
      <AddNewCoinCard refetchCoins={refetchCoins} />
    </div>
  );
}
