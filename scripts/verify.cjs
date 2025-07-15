const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.VITE_BELIEF_MARKET_ADDRESS;
  const args = [];

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: args,
    network: "incentiv-testnet",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 