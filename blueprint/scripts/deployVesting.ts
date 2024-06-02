import { toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const vesting = provider.open(
        Vesting.createFromConfig(
            {
                totalCoinsLocked: 0n,
                totalReward: 0n,
                depositsEndTime: Math.floor(Date.now() / 1000) + 60,
                vestingStartTime: Math.floor(Date.now() / 1000) + 120,
                vestingTotalDuration: 600,
                unlockPeriod: 60,
            },
            await compile('Vesting'),
        ),
    );
    await vesting.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(vesting.address);
    console.log('Vesting contract deployed at address:', vesting.address.toString());
}