require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL, // or Infura URL
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
