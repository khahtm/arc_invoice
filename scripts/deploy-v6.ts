import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying V6 with:', deployer.address);

  const USDC = '0x3600000000000000000000000000000000000000';
  const FEE_COLLECTOR = '0xAE80D683b366e144DFdDD7e2D9667414F689CD9f';

  const Factory = await ethers.getContractFactory('ArcDealFactory');
  const factory = await Factory.deploy(USDC, FEE_COLLECTOR);
  await factory.waitForDeployment();

  const addr = await factory.getAddress();
  console.log('ArcDealFactory deployed to:', addr);
  console.log('\nAdd to lib/contracts/addresses.ts:');
  console.log(`    DEAL_FACTORY: '${addr}' as const,`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
