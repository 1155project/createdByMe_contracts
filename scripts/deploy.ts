import { ethers } from "hardhat";

async function main() {
  console.log('Deploy CreatorNameService ...')
  const CreatorNameService = await ethers.getContractFactory("CreatorNameService", );
  const creatorNameService = await CreatorNameService.deploy();
  await creatorNameService.waitForDeployment();
  console.log(`CreatorNameService contract successfully deployed to ${await creatorNameService.getAddress()}`);

  console.log('Deploy AssetCreatorFactor ...');
  const AssetCreatorFactory= await ethers.getContractFactory("AssetCreatorFactory", );
  const assetCreatorFactory = await AssetCreatorFactory.deploy(creatorNameService.getAddress());
  await assetCreatorFactory.waitForDeployment();
  console.log(`AssetCreatorFactory contract successfully deployed to ${await assetCreatorFactory.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
