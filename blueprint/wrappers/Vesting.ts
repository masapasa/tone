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
      return new Vesting(contractAddress(workchain, init), init);
    }
  
    async sendDeposit(provider: ContractProvider, via: Sender, opts: { value: bigint }) {
      await provider.internal(via, {
        value: opts.value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell()
          .storeUint(0, 32)
          .storeUint(0x64, 8) // 'd' in hex
          .endCell(),
      });
    }
  
    async sendWithdraw(provider: ContractProvider, via: Sender, opts: { value: bigint }) {
      await provider.internal(via, {
        value: opts.value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell()
          .storeUint(0, 32)
          .storeUint(0x77, 8) // 'w' in hex
          .endCell(),
      });
    }
  
    async sendReward(provider: ContractProvider, via: Sender, opts: { value: bigint }) {
      await provider.internal(via, {
        value: opts.value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell()
          .storeUint(0, 32)
          .storeUint(0x72, 8) // 'r' in hex
          .endCell(),
      });
    }
  
    async getBalance(provider: ContractProvider) {
      const { stack } = await provider.get("balance", []);
      return {
        balance: stack.readBigNumber(),
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
  }