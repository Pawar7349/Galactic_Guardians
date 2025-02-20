require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  mocha: {
    timeout: 200000
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId:31337
    }
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    tests: "./test"
  }
};