import { Button, Input, Modal } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

export default function Onboarding({ refetch }: { refetch: () => void }) {
  const { data: sessionData } = useSession();
  const [exchangeName, setExchangeName] = useState<"binance" | "">("");
  const [exchangeApiKey, setExchangeApiKey] = useState("");
  const [exchangeApiSecret, setExchangeApiSecret] = useState("");
  const updateUserExchangeData = api.user.updateUserExchangeData.useMutation();
  const createUserStats = api.user.createUserStats.useMutation();
  const userId = sessionData?.user.id;

  const confirmOnboarding = async () => {
    if (!userId || !exchangeName) return;

    await updateUserExchangeData.mutateAsync({
      userId,
      exchangeName,
      exchangeApiKey,
      exchangeApiSecret,
    });
    await createUserStats.mutateAsync({
      userId,
    });
    refetch();
  };

  return (
    <>
      <Modal
        onClose={() => {
          false;
        }}
        opened={true}
        withCloseButton={false}
        title="Welcome 👋"
      >
        <>
          {!exchangeName && (
            <>
              <p className="text-md font-bold">
                Please select your crypto exchange platform:
              </p>
              <div className="flex items-center justify-center">
                <Button
                  color="primary"
                  onClick={() => setExchangeName("binance")}
                >
                  Binance
                </Button>
              </div>
            </>
          )}
          {exchangeName && (
            <>
              <p className="text-md font-bold">Please enter your API key:</p>
              <Input
                type="text"
                placeholder="API Key"
                value={exchangeApiKey}
                onChange={(e) => setExchangeApiKey(e.target.value)}
              />
              <p className="text-md font-bold">Please enter your API secret:</p>
              <Input
                type="text"
                placeholder="API Key Secret"
                value={exchangeApiSecret}
                onChange={(e) => setExchangeApiSecret(e.target.value)}
              />
            </>
          )}

          <Button
            disabled={!exchangeName || !exchangeApiKey}
            color="success"
            onClick={() => void confirmOnboarding()}
          >
            Confirm
          </Button>
        </>
      </Modal>
    </>
  );
}
