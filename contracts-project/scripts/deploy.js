import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying MyNFT contract...");

  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();

  await myNFT.waitForDeployment();

  const contractAddress = await myNFT.getAddress();

  console.log("MyNFT deployed to:", contractAddress);
  console.log("Save this address — you'll need it in the frontend .env file");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});