import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

export default function Onboarding({refetch}:{refetch: () => void }) {
  const {data: sessionData}= useSession()
  const [exchangeName, setExchangeName]= useState<"binance"|"">("");
  const [exchangeApiKey, setExchangeApiKey]= useState("");
  const [exchangeApiSecret, setExchangeApiSecret]= useState("");
  const updateUserExchangeData= api.user.updateUserExchangeData.useMutation();
  const userId=sessionData?.user.id;
  
  const confirmOnboarding=async()=>{
    if(!userId || !exchangeName) return;
              
    await updateUserExchangeData.mutateAsync({
      userId,
      exchangeName,
      exchangeApiKey,
      exchangeApiSecret
    })
    refetch();
  }

  return (
    <>
      <Modal isOpen={true} closeButton={false} >
        <ModalContent> 
            <>
              <ModalHeader className="flex flex-col gap-1">Welcome 👋</ModalHeader>
               {!exchangeName  &&
                <ModalBody>
                <p className="text-md font-bold"> 
                  Please select your crypto exchange platform: 
                </p>
                <div className="flex items-center justify-center">
               <Button color='primary' onClick={()=> setExchangeName('binance')}>
                Binance
               </Button>
                </div>
              </ModalBody>}
              {exchangeName &&
                <ModalBody>
                  <p className="text-md font-bold">
                    Please enter your API key:
                    </p>
                    <Input type='text' label='API Key' value={exchangeApiKey} onChange={(e)=>setExchangeApiKey(e.target.value)}/>
                    <p className="text-md font-bold">
                      Please enter your API secret:
                    </p>
                    <Input type='text' label='API Key Secret' value={exchangeApiSecret} onChange={(e)=>setExchangeApiSecret(e.target.value)}/>
                  </ModalBody>
              }
              <ModalFooter>
                <Button isDisabled={!exchangeName || !exchangeApiKey} color='success' onClick={()=>void confirmOnboarding()}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
        </ModalContent>
      </Modal>
    </>
  );
}
