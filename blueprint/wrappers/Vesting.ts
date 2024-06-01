import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type VestingConfig = {
    total_coins_locked: bigint;
    total_reward: bigint;
    deposits_end_time: number;
    vesting_start_time: number;
    vesting_total_duration: number;
    unlock_period: number;
    bill_code: Cell;
    // id: number;
    // counter: number;
};

export function VestingConfigToCell(config: VestingConfig): Cell {
    return beginCell()
        .storeCoins(config.total_coins_locked)
        .storeCoins(config.total_reward)
        .storeUint(config.deposits_end_time, 32)
        .storeUint(config.vesting_start_time, 32)
        .storeUint(config.vesting_total_duration, 32)
        .storeUint(config.unlock_period, 32)
        .storeRef(config.bill_code)
        .endCell();
}

export const StringOp = {
    deposit: 0x64,
    withdraw: 0x77,
    reward: 0x72,
};

export class Vesting implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new Vesting(address);
    }

    static createFromConfig(config: VestingConfig, code: Cell, workchain = 0) {
        const data = VestingConfigToCell(config);
        const init = { code, data };
        return new Vesting(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDeposit(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0, 32)
                .storeUint(StringOp.deposit, 8)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.increaseBy, 32)
                .endCell(),
        });
    }

    async getCounter(provider: ContractProvider) {
        const result = await provider.get('get_counter', []);
        return result.stack.readNumber();
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }
}
