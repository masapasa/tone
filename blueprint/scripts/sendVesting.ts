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

    const action = await ui.select('Select an action', ['Deposit', 'Withdraw', 'Add Reward']);

    if (action === 'Deposit') {
        const depositAmount = toNano(await ui.input('Enter the deposit amount (in TON)'));
        const depositResult = await vesting.sendDeposit(provider.sender(), {
            value: depositAmount,
        });
        ui.write('Deposit transaction sent. Transaction hash:', depositResult.transaction.id.hash.toString());
    } else if (action === 'Withdraw') {
        const withdrawResult = await provider.sender().send({
            to: vesting.address,
            value: toNano('0.1'),
            bounce: false,
            body: Buffer.from('w'),
        });
        ui.write('Withdraw transaction sent. Transaction hash:', withdrawResult.transaction.id.hash.toString());
    } else if (action === 'Add Reward') {
        const rewardAmount = toNano(await ui.input('Enter the reward amount (in TON)'));
        const rewardResult = await provider.sender().send({
            to: vesting.address,
            value: rewardAmount,
            bounce: false,
            body: Buffer.from('r'),
        });
        ui.write('Reward transaction sent. Transaction hash:', rewardResult.transaction.id.hash.toString());
    }

    ui.write('Waiting for the transaction to be confirmed...');
    await sleep(10000);

    const lockerData = await vesting.getLockerData();
    ui.write('Vesting contract data:');
    ui.write('- Total coins locked:', lockerData.totalCoinsLocked.toString());
    ui.write('- Total reward:', lockerData.totalReward.toString());
    ui.write('- Deposits end time:', new Date(lockerData.depositsEndTime * 1000).toLocaleString());
    ui.write('- Vesting start time:', new Date(lockerData.vestingStartTime * 1000).toLocaleString());
    ui.write('- Vesting total duration:', lockerData.vestingTotalDuration.toString());
    ui.write('- Unlock period:', lockerData.unlockPeriod.toString());
}