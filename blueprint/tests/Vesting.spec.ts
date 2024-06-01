import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Vesting', () => {
  let code: Cell;

  beforeAll(async () => {
    code = await compile('Vesting');
  });

  let blockchain: Blockchain;
  let deployer: SandboxContract<TreasuryContract>;
  let vesting: SandboxContract<Vesting>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    vesting = blockchain.openContract(
      Vesting.createFromConfig(
        {
          totalCoinsLocked: 0,
          totalReward: 0,
          depositsEndTime: Math.floor(Date.now() / 1000) + 60,
          vestingStartTime: Math.floor(Date.now() / 1000) + 120,
          vestingTotalDuration: 600,
          unlockPeriod: 60,
          billCode: await compile('LockerBill'),
        },
        code,
      ),
    );
    deployer = await blockchain.treasury('deployer');
    const deployResult = await vesting.sendDeploy(deployer.getSender(), toNano('0.05'));
    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: vesting.address,
      deploy: true,
      success: true,
    });
  });

  it('should deploy', async () => {
    // the check is done inside beforeEach
    // blockchain and vesting are ready to use
  });

  it('should deposit and withdraw funds', async () => {
    const user = await blockchain.treasury('user');
    const userAddress = user.address;
    const billAddress = await vesting.getBillAddress(userAddress);

    // Deposit funds
    const depositAmount = toNano('100');
    const depositResult = await user.send({
      to: vesting.address,
      value: depositAmount,
      bounce: false,
      body: Cell.fromBoc(Buffer.from('d'))[0], // 'd' for deposit
    });
    expect(depositResult.transactions).toHaveTransaction({
      from: user.address,
      to: vesting.address,
      success: true,
    });

    // Check bill data
    const billData = await blockchain.getContract(billAddress).getLockerBillData();
    expect(billData.totalCoinsDeposit).toEqual(depositAmount.toString());

    // Withdraw funds
    const withdrawResult = await user.send({
      to: vesting.address,
      value: toNano('0.1'),
      bounce: false,
      body: Cell.fromBoc(Buffer.from('w'))[0], // 'w' for withdraw
    });
    expect(withdrawResult.transactions).toHaveTransaction({
      from: user.address,
      to: vesting.address,
      success: true,
    });
    expect(withdrawResult.transactions).toHaveTransaction({
      from: billAddress,
      to: user.address,
      success: true,
    });
  });

  it('should add reward', async () => {
    const rewarder = await blockchain.treasury('rewarder');
    const rewardAmount = toNano('50');

    // Add reward
    const rewardResult = await rewarder.send({
      to: vesting.address,
      value: rewardAmount,
      bounce: false,
      body: Cell.fromBoc(Buffer.from('r'))[0], // 'r' for reward
    });
    expect(rewardResult.transactions).toHaveTransaction({
      from: rewarder.address,
      to: vesting.address,
      success: true,
    });

    // Check locker data
    const lockerData = await vesting.getLockerData();
    expect(lockerData.totalReward).toEqual(rewardAmount.toString());
  });
});