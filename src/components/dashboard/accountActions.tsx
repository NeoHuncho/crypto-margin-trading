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
import { useState } from "react";

export default function AccountActions() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [buyPercentage, setBuyPercentage] = useState("30");

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
              <Button fullWidth color="success">
                Buy
              </Button>
            </div>
            <Divider className="my-2" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
