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

export type vestingConfig = {
  id: number;
};

export function vestingConfigToCell(config: vestingConfig): Cell {
  return beginCell().storeUint(config.id, 64).endCell();
}

export class Vesting implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new Vesting(address);
  }

  static createFromConfig(config: vestingConfig, code: Cell, workchain = 0) {
    const data = vestingConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new Vesting(address, init);
  }

  async sendPlay(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(1, 32).endCell(),
    });
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(2, 32).endCell(),
    });
  }

  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get("balance", []);
    return {
      balance: stack.readNumber(),
    };
  }
  async getLockerData(provider: ContractProvider) {
    const { stack } = await provider.get("lockerData", []);
    return {
      totalCoinsLocked: stack.readNumber(),
      totalReward: stack.readNumber(),
      depositsEndTime: stack.readNumber(),
      vestingStartTime: stack.readNumber(),
      vestingTotalDuration: stack.readNumber(),
      unlockPeriod: stack.readNumber(),
    };
  }
  async getBillAddress(provider: ContractProvider, userAddress: Address) {
    const { stack } = await provider.get("getBillAddress", [userAddress]);
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