const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  // Configuration
  const BET_ID = process.env.BET_ID;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

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
    console.log("🚀 Starting resolve script...");
    console.log(`📋 Bet ID: ${BET_ID}`);
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`👤 Signer address: ${signer.address}`);

    // Get contract
    const BeliefMarket = await ethers.getContractFactory("BeliefMarket");
    const contract = BeliefMarket.attach(CONTRACT_ADDRESS);

    // Get bet info before resolving
    console.log("\n📊 Getting bet info...");
    const betInfo = await contract.getBetInfo(BET_ID);
    console.log(`📊 Creator: ${betInfo.creator}`);
    console.log(`📊 Platform stake: ${ethers.utils.formatEther(betInfo.platformStake)} TCENT`);
    console.log(`📊 Vote stake: ${ethers.utils.formatEther(betInfo.voteStake)} TCENT`);
    console.log(`📊 Expiry time: ${new Date(betInfo.expiryTime * 1000).toLocaleString()}`);
    console.log(`📊 Is resolved: ${betInfo.isResolved}`);
    console.log(`📊 YES votes: ${betInfo.totalYesVotes}`);
    console.log(`📊 NO votes: ${betInfo.totalNoVotes}`);
    console.log(`📊 Prize pool: ${ethers.utils.formatEther(betInfo.prizePool)} TCENT`);

    if (betInfo.isResolved) {
      console.error("❌ Bet is already resolved!");
      process.exit(1);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = betInfo.expiryTime.toNumber();
    
    if (currentTime < expiryTime) {
      console.error("❌ Bet has not expired yet!");
      console.log(`⏰ Current time: ${new Date(currentTime * 1000).toLocaleString()}`);
      console.log(`⏰ Expiry time: ${new Date(expiryTime * 1000).toLocaleString()}`);
      console.log(`⏰ Time remaining: ${Math.floor((expiryTime - currentTime) / 60)} minutes`);
      process.exit(1);
    }

    // Determine winner
    const yesWon = betInfo.totalYesVotes > betInfo.totalNoVotes;
    const isTie = betInfo.totalYesVotes === betInfo.totalNoVotes;
    
    console.log(`\n🏆 Bet outcome:`);
    console.log(`🏆 YES votes: ${betInfo.totalYesVotes}`);
    console.log(`🏆 NO votes: ${betInfo.totalNoVotes}`);
    
    if (isTie) {
      console.log("🏆 Result: TIE - All voters will be refunded");
    } else {
      console.log(`🏆 Winner: ${yesWon ? "YES" : "NO"}`);
    }

    // Resolve bet
    console.log("\n🔍 Resolving bet...");
    const tx = await contract.resolveBet(BET_ID, {
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
    console.log(`📊 Is resolved: ${updatedBetInfo.isResolved}`);
    console.log(`📊 YES won: ${updatedBetInfo.yesWon}`);

    if (isTie) {
      console.log("\n🎉 Bet resolved as TIE!");
      console.log("💰 All voters have been automatically refunded");
    } else {
      console.log("\n🎉 Bet resolved successfully!");
      console.log(`🏆 Winner: ${updatedBetInfo.yesWon ? "YES" : "NO"}`);
      console.log("💰 Winners can now claim their prizes");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.transaction) {
      console.error(`📝 Failed transaction hash: ${error.transaction.hash}`);
    }
    
    // Provide helpful error messages
    if (error.message.includes("Not expired yet")) {
      console.log("💡 This error occurs when the bet hasn't expired yet");
    } else if (error.message.includes("Already resolved")) {
      console.log("💡 This error occurs when the bet is already resolved");
    } else if (error.message.includes("Bet doesn't exist")) {
      console.log("💡 This error occurs when the bet ID doesn't exist");
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 