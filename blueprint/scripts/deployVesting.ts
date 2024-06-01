import { toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const vesting = provider.open(
        Vesting.createFromConfig(
            {
                total_coins_locked: 0n,
                total_reward: 0n,
                deposits_end_time: 0,
                vesting_start_time: 0,
                vesting_total_duration: 0,
                unlock_period: 0,
                bill_code: undefined
            },
            await compile('Vesting'),
        ),
    );

    await vesting.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(vesting.address);

    console.log('ID', await vesting.getID());
}
