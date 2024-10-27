import { Address, toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Vesting contract address'));
    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }
    const vesting = provider.open(Vesting.createFromAddress(address));
    const action = await ui.choose('Select an action', ['Deposit', 'Withdraw', 'Add Reward']);

    if (action === 'Deposit') {
        const depositAmount = toNano(await ui.input('Enter the deposit amount (in TON)'));
        await vesting.sendDeposit(provider.sender(), { value: depositAmount });
        ui.write('Deposit transaction sent.');
    } else if (action === 'Withdraw') {
        await vesting.sendWithdraw(provider.sender(), { value: toNano('0.05') });
        ui.write('Withdraw transaction sent.');
    } else if (action === 'Add Reward') {
        const rewardAmount = toNano(await ui.input('Enter the reward amount (in TON)'));
        await vesting.sendReward(provider.sender(), { value: rewardAmount });
        ui.write('Reward transaction sent.');
    }
    ui.write('Waiting for the transaction to be confirmed...');
    await sleep(10000);
    const lockerData = await vesting.getLockerData();
    ui.write('Vesting contract data:');
    ui.write(`- Total coins locked: ${lockerData.totalCoinsLocked.toString()}`);
    ui.write(`- Total reward: ${lockerData.totalReward.toString()}`);
    ui.write(`- Deposits end time: ${new Date(lockerData.depositsEndTime * 1000).toLocaleString()}`);
    ui.write(`- Vesting start time: ${new Date(lockerData.vestingStartTime * 1000).toLocaleString()}`);
    ui.write(`- Vesting total duration: ${lockerData.vestingTotalDuration.toString()}`);
    ui.write(`- Unlock period: ${lockerData.unlockPeriod.toString()}`);
}