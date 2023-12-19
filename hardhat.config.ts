import dotenv from 'dotenv'; 
dotenv.config();  // Load environment variables from .env file 
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import env from "hardhat";
require("hardhat-contract-sizer");

const testRpcNodeUrl = process.env.TEST_RPC_NODE_URL ?? '';
const testWalletSecret = process.env.TEST_WALLET_SECRET ?? '';
const prodRpcNodeUrl = process.env.PROD_RPC_NODE_URL ?? '';
const prodWalletSecret = process.env.PROD_WALLET_SECRET ?? '';

const config: HardhatUserConfig = {
  solidity:
  {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    testNetwork: {
      url: testRpcNodeUrl,
      accounts: [
        testWalletSecret,
      ],
    },
    prodNetwork: {
      url: prodRpcNodeUrl,
      accounts: [
        prodWalletSecret,
      ],
    },
  },
};

export default config;
