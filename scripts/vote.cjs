const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Configuration
  const BET_ID = process.env.BET_ID;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const VOTE_STAKE = process.env.VOTE_STAKE || "10"; // Default 10 TCENT
  const VOTE_YES = false; // Vote NO to ensure NO wins

  if (!BET_ID) {
    console.error("❌ BET_ID not provided in environment variables");
    process.exit(1);
  }

  if (!CONTRACT_ADDRESS) {
    console.error("❌ CONTRACT_ADDRESS not provided in environment variables");
    process.exit(1);
  }

  if (!process.env.VITE_PRIVATE_KEY) {
    console.error("❌ VITE_PRIVATE_KEY not provided in environment variables");
    process.exit(1);
  }

  try {
    console.log("🚀 Starting vote script...");
    console.log(`📋 Bet ID: ${BET_ID}`);
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`📋 Vote Stake: ${VOTE_STAKE} TCENT`);
    console.log(`📋 Voting: ${VOTE_YES ? "YES" : "NO"}`);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`👤 Signer address: ${signer.address}`);

    // Get contract
    const BeliefMarket = await ethers.getContractFactory("BeliefMarket");
    const contract = BeliefMarket.attach(CONTRACT_ADDRESS);

    // Get bet info before voting
    console.log("\n📊 Getting bet info...");
    const betInfo = await contract.getBetInfo(BET_ID);
    console.log(`📊 Current YES votes: ${betInfo.totalYesVotes}`);
    console.log(`📊 Current NO votes: ${betInfo.totalNoVotes}`);
    console.log(`📊 Prize pool: ${ethers.utils.formatEther(betInfo.prizePool)} TCENT`);
    console.log(`📊 Expiry time: ${new Date(betInfo.expiryTime * 1000).toLocaleString()}`);
    console.log(`📊 Is resolved: ${betInfo.isResolved}`);

    if (betInfo.isResolved) {
      console.error("❌ Bet is already resolved!");
      process.exit(1);
    }

    if (betInfo.expiryTime.toNumber() <= Math.floor(Date.now() / 1000)) {
      console.error("❌ Bet has expired!");
      process.exit(1);
    }

    // Check if already voted
    const userVote = await contract.getUserVote(BET_ID, signer.address);
    if (userVote.amount.gt(0)) {
      console.error("❌ Already voted on this bet!");
      process.exit(1);
    }

    // Cast vote
    console.log("\n🗳️ Casting vote...");
    const voteStakeWei = ethers.utils.parseEther(VOTE_STAKE);
    
    const tx = await contract.castVote(BET_ID, VOTE_YES, {
      value: voteStakeWei,
      gasLimit: 500000
    });

    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log(`🔗 Explorer: ${process.env.VITE_INCENTIV_EXPLORER || 'https://explorer.incentiv.network'}/tx/${tx.hash}`);

    // Wait for confirmation
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Get updated bet info
    console.log("\n📊 Updated bet info...");
    const updatedBetInfo = await contract.getBetInfo(BET_ID);
    console.log(`📊 YES votes: ${updatedBetInfo.totalYesVotes}`);
    console.log(`📊 NO votes: ${updatedBetInfo.totalNoVotes}`);
    console.log(`📊 Prize pool: ${ethers.utils.formatEther(updatedBetInfo.prizePool)} TCENT`);

    console.log("\n🎉 Vote cast successfully!");
    console.log(`🗳️ Voted: ${VOTE_YES ? "YES" : "NO"}`);
    console.log(`💰 Stake: ${VOTE_STAKE} TCENT`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.transaction) {
      console.error(`📝 Failed transaction hash: ${error.transaction.hash}`);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
