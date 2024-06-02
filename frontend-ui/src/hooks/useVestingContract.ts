import { useEffect, useState } from "react";
import { Vesting } from "../contracts/Vesting";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";
import { toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

type VestingData = {
  totalCoinsLocked: bigint;
  totalReward: bigint;
  depositsEndTime: number;
  vestingStartTime: number;
  vestingTotalDuration: number;
  unlockPeriod: number;
};

export function useVestingContract(contractAddress: string) {
  const client = useTonClient();
  const [balance, setBalance] = useState<bigint>();
  const [depositEndTime, setDepositEndTime] = useState<number>();
  const [vestingData, setVestingData] = useState<VestingData>();
  const { sender } = useTonConnect();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const vestingContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Vesting(Address.parse(contractAddress));
    return client.open(contract) as OpenedContract<Vesting>;
  }, [client]);

  useEffect(() => {
    async function getBalance() {
      if (!vestingContract) return;
      const { balance } = await vestingContract.getBalance();
      setBalance(BigInt(balance));
    }

    async function getVestingData() {
      if (!vestingContract) return;
      const data = await vestingContract.getLockerData();
      setDepositEndTime(data.depositsEndTime);
      setVestingData({
        totalCoinsLocked: data.totalCoinsLocked,
        totalReward: data.totalReward,
        depositsEndTime: data.depositsEndTime,
        vestingStartTime: data.vestingStartTime,
        vestingTotalDuration: data.vestingTotalDuration,
        unlockPeriod: data.unlockPeriod,
      });
    }

    async function pollData() {
      await getBalance();
      await getVestingData();
      await sleep(5000);
      pollData();
    }

    pollData();
  }, [vestingContract]);

  return {
    balance,
    depositEndTime,
    vestingData,
    sendDeposit: async (amount: number) => {
      try {
        await vestingContract?.sendDeposit(sender, {
          value: toNano(BigInt(amount)),
        });
      } catch (error) {
        console.error('Error sending deposit:', error);
      }
    },
    sendWithdraw: async () => {
      try {
        await vestingContract?.sendWithdraw(sender, {
          value: toNano(0.1),
        });
      } catch (error) {
        console.error('Error sending withdraw:', error);
      }
    },
    sendReward: async (amount: number) => {
      try {
        await vestingContract?.sendReward(sender, {
          value: toNano(BigInt(amount)),
        });
      } catch (error) {
        console.error('Error sending reward:', error);
      }
    }
  };
}
