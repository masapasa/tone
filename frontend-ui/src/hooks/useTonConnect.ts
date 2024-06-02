import { useTonConnectUI } from "@tonconnect/ui-react";
import { Sender, SenderArguments } from "@ton/core";

export function useTonConnect(): { sender: Sender; connected: boolean } {
  const [tonConnectUI] = useTonConnectUI();
  
  return {
    sender: {
      send: async (args: SenderArguments) => {
        try {
          await tonConnectUI.sendTransaction({
            messages: [
              {
                address: args.to.toString(),
                amount: args.value.toString(),
                payload: args.body?.toBoc().toString("base64"),
              },
            ],
            validUntil: Date.now() + 5 * 60 * 1000, 
          });
        } catch (error) {
          console.error('Error sending transaction:', error);
        }
      },
    },
    connected: tonConnectUI.connected,
  };
}
