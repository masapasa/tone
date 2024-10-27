import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from "@ton/core";

  export type VestingConfig = {
    totalCoinsLocked: bigint;
    totalReward: bigint;
    depositsEndTime: number;
    vestingStartTime: number;
    vestingTotalDuration: number;
    unlockPeriod: number;
    billCode: Cell;
};

  export function vestingConfigToCell(config: VestingConfig): Cell {
    return beginCell()
      .storeCoins(config.totalCoinsLocked)
      .storeCoins(config.totalReward)
      .storeUint(config.depositsEndTime, 32)
      .storeUint(config.vestingStartTime, 32)
      .storeUint(config.vestingTotalDuration, 32)
      .storeUint(config.unlockPeriod, 32)
      .storeRef(config.billCode)
      .endCell();
}

export class Vesting implements Contract {
  constructor(
    readonly address: Address,
      readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new Vesting(address);
  }

    static createFromConfig(config: VestingConfig, code: Cell, workchain = 0) {
    const data = vestingConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new Vesting(address, init);
  }

    async sendDeposit(
      provider: ContractProvider,
      via: Sender,
      opts: { value: bigint }
    ) {
    await provider.internal(via, {
        value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().storeUint(0, 32).storeUint(0x64, 8).endCell(), // 'd'
    });
  }

    async sendWithdraw(
      provider: ContractProvider,
      via: Sender,
      opts: { value: bigint }
    ) {
    await provider.internal(via, {
        value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().storeUint(0, 32).storeUint(0x77, 8).endCell(), // 'w'
      });
    }
  
    async sendReward(
      provider: ContractProvider,
      via: Sender,
      opts: { value: bigint }
    ) {
      await provider.internal(via, {
        value: opts.value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell().storeUint(0, 32).storeUint(0x72, 8).endCell(), // 'r'
    });
  }

  async getBalance(provider: ContractProvider) {
      const { balance } = await provider.getState();
    return {
        balance: BigInt(balance),
    };
  }
  
  async getLockerData(provider: ContractProvider) {
      const { stack } = await provider.get("get_locker_data", []);
    return {
        totalCoinsLocked: stack.readBigNumber(),
        totalReward: stack.readBigNumber(),
      depositsEndTime: stack.readNumber(),
      vestingStartTime: stack.readNumber(),
      vestingTotalDuration: stack.readNumber(),
      unlockPeriod: stack.readNumber(),
    };
  }
  
  async getBillAddress(provider: ContractProvider, userAddress: Address) {
      const { stack } = await provider.get("get_bill_address", [
        { type: "slice", cell: beginCell().storeAddress(userAddress).endCell() },
      ]);
    return stack.readAddress();
  }
  async sendDeposit(provider: ContractProvider, via: Sender, opts: { value: bigint }) {
    await provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(0, 32).storeUint(0x64, 8).endCell()
    });
  }
  
  async sendWithdraw(provider: ContractProvider, via: Sender, opts: { value: bigint }) {
    await provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(0, 32).storeUint(0x77, 8).endCell(),
    });
  }
  async sendReward(provider: ContractProvider, via: Sender, opts: { value: bigint }) {
    await provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(0, 32).storeUint(0x72, 8).endCell(),
    });
  }
}