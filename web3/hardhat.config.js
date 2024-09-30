require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    zkEVMTestnet: {
      url: process.env.API_URL,
      accounts: process.env.PRIVATE_KEY !== undefined ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 2442,
      gasPrice: 1000000000
    },
  }
 
};
