import { useEffect, useState } from "react";
import { vesting } from "../contracts/vesting";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";
import { toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

export function usevestingContract(
  contractAddress: string,
) {
  const client = useTonClient();
  const [contractData, setContractData] = useState<
    null | {
      balance: number;
    }
  >();

  const { sender } = useTonConnect();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const vestingContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new vesting(
      Address.parse(contractAddress),
    );
    return client.open(contract) as OpenedContract<vesting>;
  }, [client]);

  useEffect(() => {
    async function getValue() {
      if (!vestingContract) return;

      const val = await vestingContract.getBalance();
      setContractData({
        balance: val.balance,
      });

      console.log(`Updated at ${new Date()}`);
      await sleep(15000);
      getValue();
    }
    getValue();
  }, [vestingContract]);

  return {
    sendPlay: (bet: number) => {
      return vestingContract?.sendPlay(sender, toNano(bet));
    },
    ...contractData,
  };
}
