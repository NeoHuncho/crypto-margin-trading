import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

export default function AccountActions() {
  const { data: sessionData } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [buyPercentage, setBuyPercentage] = useState("30");
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
      <Button onPress={onOpen}>Account actions</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Account actions
          </ModalHeader>
          <ModalBody>
            <div className="flex items-center justify-center">
              <p>Buy</p>
              <Input
                key="sm"
                value={buyPercentage}
                onValueChange={setBuyPercentage}
                type="number"
                classNames={{ base: "w-16 mx-2" }}
                max={100}
              />
              <p>% of available balance for all coins</p>
            </div>
            <div className="mx-6 flex">
              <Button
                onClick={() => void orderCoins()}
                fullWidth
                color="success"
                isLoading={isLoadingOrderCoins}
              >
                Buy
              </Button>
            </div>
            {hasErrored && (
              <p className="text-center text-red-500">An error has occurred</p>
            )}

            <Divider className="my-2" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
