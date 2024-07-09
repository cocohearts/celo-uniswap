require("@nomiclabs/hardhat-ethers");
require("hardhat-tracer");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");

module.exports = {
    solidity: "0.7.6",
    networks: {
        hardhat: {
            forking: {
                url: "https://forno.celo.org",
                blockNumber: 12345678  // Optionally specify the block number to fork from
            }
        }
    }
};