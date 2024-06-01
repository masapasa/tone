import { Address, toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Sample address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const vesting = provider.open(Vesting.createFromAddress(address));

    const counterBefore = Vesting.apply(vesting.getCounter(), BigInt(0),

        await vesting.sendIncrease(provider.sender(), {
            increaseBy: 1,
            value: toNano('0.05'),
        }));

    ui.write('Waiting for counter to increase...');

    let counterAfter = await vesting.getCounter();
    let attempt = 1;
    while (counterAfter === counterBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await vesting.getCounter();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
