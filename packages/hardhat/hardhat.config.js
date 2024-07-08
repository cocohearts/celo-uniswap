require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.7.6",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        celoFork: {
            url: "http://127.0.0.1:8545",
            chainId: 1337, // Ensure this matches the chainId used by Ganache
            forking: {
                url: "https://alfajores-forno.celo-testnet.org",
                blockNumber: 26444318,
            },
        },
        alfajores: {
            url: "https://alfajores-forno.celo-testnet.org",
            accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
        },
        celo: {
            url: "https://forno.celo.org",
            accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"],
        },
    },
    etherscan: {
        apiKey: {
            alfajores: process.env.CELOSCAN_API_KEY,
            celo: process.env.CELOSCAN_API_KEY,
        },
        customChains: [
            {
                network: "alfajores",
                chainId: 44787,
                urls: {
                    apiURL: "https://api-alfajores.celoscan.io/api",
                    browserURL: "https://alfajores.celoscan.io",
                },
            },
            {
                network: "celo",
                chainId: 42220,
                urls: {
                    apiURL: "https://api.celoscan.io/api",
                    browserURL: "https://celoscan.io/",
                },
            },
        ],
    },
};
