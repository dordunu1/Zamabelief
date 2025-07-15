require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    incentiv: {
      url: process.env.VITE_INCENTIV_RPC_URL || 'https://rpc.testnet.incentiv.net',
      chainId: 11690,
      accounts: process.env.VITE_PRIVATE_KEY ? [process.env.VITE_PRIVATE_KEY] : [],
    },
    "incentiv-testnet": {
      url: "https://explorer.incentiv.network/api/eth-rpc",
      chainId: 11690,
      accounts: process.env.VITE_PRIVATE_KEY ? [process.env.VITE_PRIVATE_KEY] : [],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: process.env.NEXT_PUBLIC_SOURCIFY_URL || '',
    browserUrl: process.env.VITE_INCENTIV_EXPLORER || '',
  },
  etherscan: {
    apiKey: {
      "incentiv-testnet": "empty",
    },
    customChains: [
      {
        network: "incentiv-testnet",
        chainId: 11690,
        urls: {
          apiURL: "https://explorer.incentiv.network/api",
          browserURL: "https://explorer.incentiv.network",
        },
      },
    ],
  }
}; 