const { ethers } = require("hardhat");

async function main() {
  const BeliefMarket = await ethers.getContractFactory("BeliefMarket");
  const contract = await BeliefMarket.deploy();
  await contract.deployed();
  console.log("BeliefMarket deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 