import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { useAsyncInitialize } from "./useAsyncInitialize";

export function useTonClient() {
  return useAsyncInitialize(async () => {
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    return new TonClient({ endpoint });
  });
}
