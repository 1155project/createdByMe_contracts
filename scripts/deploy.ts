import { ethers } from "hardhat";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

async function main() {
  const AUTH_ROLE = keccak256(toUtf8Bytes("AUTH_ROLE"));
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

  // Make factory contract an auth of creator name service.
  await creatorNameService.grantRole(AUTH_ROLE, assetCreatorFactory.getAddress());
  console.log('AssetCreatorFactory contract instance granted AUTH_ROLE in CreatorNameService instance.');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
