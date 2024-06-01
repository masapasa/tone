import { toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    //const billCode = await compile('LockerBill');
    const vesting = provider.open(
        Vesting.createFromConfig(
            {
                total_coins_locked: 0n,
                total_reward: 0n,
                deposits_end_time: Math.floor(Date.now() / 1000) + 60,
                vesting_start_time: Math.floor(Date.now() / 1000) + 120,
                vesting_total_duration: 600,
                unlock_period: 60,
                bill_code: billCode,
            },
            await compile('Vesting'),
        ),
    );
    await vesting.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(vesting.address);
    console.log('Vesting contract deployed at address:', vesting.address.toString());
}