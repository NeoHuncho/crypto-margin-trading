import { Button, Divider, Modal, NumberInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

export default function AccountActions() {
  const { data: sessionData } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const [buyPercentage, setBuyPercentage] = useState<string | number>(30);
  const [hasErrored, setHasErrored] = useState(false);
  const [isLoadingOrderCoins, setIsLoadingOrderCoins] = useState(false);
  const buySellMarginCoinsPercentage =
    api.binance.buySellMarginCoinsPercentage.useMutation({
      onError: (error) => {
        console.error(error);
        setHasErrored(true);
        setIsLoadingOrderCoins(false);
      },
    });

  const orderCoins = async () => {
    setIsLoadingOrderCoins(true);
    setHasErrored(false);
    await buySellMarginCoinsPercentage.mutateAsync({
      userId: sessionData?.user.id ?? "",
      percentage: Number(buyPercentage) / 100,
      allUserCoins: true,
    });

    setIsLoadingOrderCoins(false);
  };
  return (
    <>
      <Button onClick={open}>Account actions</Button>
      <Modal opened={opened} onClose={close} centered title="Account Actions">
        <div className="flex w-full items-center justify-center">
          <p>Buy</p>
          <NumberInput
            key="sm"
            value={buyPercentage}
            onChange={setBuyPercentage}
            classNames={{ input: "w-16", wrapper: "mx-2" }}
            max={100}
            error={hasErrored ? "An error has occurred" : false}
          />
          <p className="whitespace-nowrap">
            % of available balance for all coins
          </p>
          <Divider className="mx-4" orientation="vertical" />
          <Button
            onClick={() => void orderCoins()}
            loading={isLoadingOrderCoins}
          >
            Buy
          </Button>
        </div>
      </Modal>
    </>
  );
}
