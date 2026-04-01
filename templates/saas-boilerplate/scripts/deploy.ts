import { ethers, upgrades } from "hardhat";

async function main() {
  const Subscription = await ethers.getContractFactory("Subscription");
  
  console.log("Deploying Subscription...");
  const subscription = await upgrades.deployProxy(Subscription, [], {
    initializer: "initialize",
    kind: "uups"
  });
  
  await subscription.deployed();
  console.log("Subscription deployed to:", subscription.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 