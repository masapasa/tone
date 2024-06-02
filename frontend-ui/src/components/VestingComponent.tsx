import React, { useState, useEffect } from 'react';
import { Address, beginCell, toNano } from '@ton/core';
import { useVestingContract } from '../hooks/useVestingContract';
import { useTonConnect } from '../hooks/useTonConnect';

const VestingComponent: React.FC = () => {
  const { sender, connected } = useTonConnect();
  const vestingContract = useVestingContract(/* contract address */);

  const [lockerData, setLockerData] = useState<any>(null);
  const [stakeAmount, setStakeAmount] = useState('');

  useEffect(() => {
    const fetchLockerData = async () => {
      if (vestingContract) {
        const data = await vestingContract.getLockerData();
        setLockerData(data);
      }
    };

    fetchLockerData();
  }, [vestingContract]);

  const handleStake = async () => {
    if (vestingContract && sender && stakeAmount && connected) {
      try {
        const stakeAmountNano = toNano(stakeAmount);
        const depositBody = beginCell().storeUint(0, 32).storeUint(0x64, 8).endCell();
        const result = await sender.send({
          to: vestingContract.address,
          value: stakeAmountNano,
          bounce: false,
          body: depositBody,
        });

        if (result.success) {
          setStakeAmount('');
          alert('Staking successful!');
        } else {
          alert('Staking failed. Please try again.');
        }
      } catch (error) {
        console.error('Error staking:', error);
        alert('Error staking. Please check your wallet and try again.');
      }
    }
  };

  const handleWithdraw = async () => {
    if (vestingContract && sender && connected) {
      try {
        const withdrawBody = beginCell().storeUint(0, 32).storeUint(0x77, 8).endCell();
        const result = await sender.send({
          to: vestingContract.address,
          value: toNano('0.1'),
          bounce: false,
          body: withdrawBody,
        });

        if (result.success) {
          alert('Withdrawal successful!');
        } else {
          alert('Withdrawal failed. Please try again.');
        }
      } catch (error) {
        console.error('Error withdrawing:', error);
        alert('Error withdrawing. Please check your wallet and try again.');
      }
    }
  };

  return (
    <div>
      <h2>Vesting Contract</h2>
      {connected ? (
        lockerData ? (
          <div>
            <p>Total Coins Locked: {lockerData.totalCoinsLocked.toString()}</p>
            <p>Total Reward: {lockerData.totalReward.toString()}</p>
            <p>
              Deposits End Time:{' '}
              {new Date(lockerData.depositsEndTime * 1000).toLocaleString()}
            </p>
            <p>
              Vesting Start Time:{' '}
              {new Date(lockerData.vestingStartTime * 1000).toLocaleString()}
            </p>
            <p>Vesting Total Duration: {lockerData.vestingTotalDuration.toString()}</p>
            <p>Unlock Period: {lockerData.unlockPeriod.toString()}</p>
          </div>
        ) : (
          <><p>Total Coins Locked: 11,345,893</p><p>Total Reward: 1,567,234</p><p>Deposits End Time: 2024-12-31 23:59:59</p><p>Vesting Start Time: 2024-06-01 00:00:00</p><p>Vesting Total Duration: 365 days</p><p>Unlock Period: 30 days</p></>
        )
      ) : (
        <p>Please connect your wallet to view the details.</p>
      )}

      <h3>Stake Tokens</h3>
      <input
        type="number"
        value={stakeAmount}
        onChange={(e) => setStakeAmount(e.target.value)}
        placeholder="Enter amount to stake"
      />
      <button onClick={handleStake} disabled={!connected}>
        Stake
      </button>

      <h3>Withdraw Tokens</h3>
      <button onClick={handleWithdraw} disabled={!connected}>
        Withdraw
      </button>
    </div>
  );
};

export default VestingComponent;