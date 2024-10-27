import { useTonConnectUI } from "@tonconnect/ui-react";
import { Sender, SenderArguments } from "@ton/core";

export function useTonConnect(): { sender: Sender | null; connected: boolean } {
  const [tonConnectUI] = useTonConnectUI();

  return {
    sender: tonConnectUI.connected
      ? {
          send: async (args: SenderArguments) => {
            try {
              await tonConnectUI.sendTransaction({
                messages: [
                  {
                    address: args.to.toString(),
                    amount: args.value.toString(),
                    payload: args.body?.toBoc().toString("base64") || '',
                  },
                ],
                validUntil: Math.floor(Date.now() / 1000) + 5 * 60,
              });
            } catch (error) {
              console.error('Error sending transaction:', error);
            }
          },
        }
      : null,
    connected: tonConnectUI.connected,
  };
}
