const { expect } = require("chai");
const { ethers } = require("hardhat");

// const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const WETH_ADDRESS = "0x122013fd7df1c6f636a5bb8f03108e876548b455";
const WETH_ADDRESS = "0x2def4285787d58a2f811af24755a8150622f4361";
const CELO_ADDRESS = "0x471EcE3750Da237f93B8E339c536989b8978a438";
const DAI_ADDRESS = "0xE4fE50cdD716522A56204352f00AA110F731932d";
const USDC_ADDRESS = "0xef4229c8c3250c675f21bcefa42f58efbff6002a";
const DAI_DECIMALS = 18;
const SwapRouterAddress = "0x5615CDAb10dc425a742d643d949a7F474C01abc4";
const QuoterAddress = "0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8";

const ercAbi = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function deposit() public payable",
  "function mint(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

describe("SimpleSwap", function () {
  it("Should provide a caller with more DAI than they started with after a swap", async function () {
    try {
      console.log("Deploying SimpleSwap contract...");
      const simpleSwapFactory = await ethers.getContractFactory("SimpleSwap");
      const simpleSwap = await simpleSwapFactory.deploy(SwapRouterAddress, QuoterAddress);
      await simpleSwap.deployed();
      console.log("SimpleSwap deployed");

      console.log("Connecting to WETH9 and wrapping some ETH...");
      let signers = await ethers.getSigners();
      let signer = signers[0];
      console.log("Signer balance:", await signer.getBalance());
      let weth9 = new ethers.Contract(WETH_ADDRESS, ercAbi, signer);
      console.log("weth9 contract initialized");
      const deposit = await weth9.deposit({ value: ethers.utils.parseEther("0.1"), gasLimit: 10000000 });
      await deposit.wait();
      console.log("ETH wrapped to WETH");

      console.log("Checking WETH balance...");
      const wethBalance = await weth9.balanceOf(signer.address);
      console.log(`WETH Balance: ${ethers.utils.formatEther(wethBalance)}`);

      console.log("Checking initial DAI balance...");

      const DAI = new ethers.Contract(DAI_ADDRESS, ercAbi, signer);
      const USDC = new ethers.Contract(USDC_ADDRESS, ercAbi, signer);
      const CELO = new ethers.Contract(CELO_ADDRESS, ercAbi, signer);

      const initialDaiBalance = await DAI.balanceOf(signer.address);
      const DAIBalance = Number(ethers.utils.formatUnits(initialDaiBalance, DAI_DECIMALS));
      console.log(`Initial DAI Balance: ${DAIBalance}`);

      console.log("Approving SimpleSwap contract to spend WETH...");
      await weth9.approve(simpleSwap.address, ethers.utils.parseEther("0.01"));
      console.log("Approval done");

      console.log("Checking allowance...");
      const allowance = await weth9.allowance(signer.address, simpleSwap.address);
      console.log(`Allowance: ${ethers.utils.formatEther(allowance)}`);

      console.log("Executing the swap...");
      const amountIn = ethers.utils.parseEther("0.001");
      try {
        const swap = await simpleSwap.swapWETHForDai(amountIn, { gasLimit: 1000000 });
        await swap.wait();
        console.log("Swap executed");
      } catch (error) {
        console.error("Swap failed:", error);
        if (error.error && error.error.data) {
          console.error("Revert reason:", error.error.data.message);
        }
      }

      console.log("Checking end DAI balance...");
      const endDaiBalance = await DAI.balanceOf(signer.address);
      const endDAIBalance = Number(ethers.utils.formatUnits(endDaiBalance, DAI_DECIMALS));
      console.log(`End DAI Balance: ${endDAIBalance}`);
      console.log(`Diff: ${endDAIBalance - DAIBalance}`);

      console.log("Asserting final DAI balance...");
      expect(endDAIBalance).is.greaterThan(DAIBalance);
      console.log("Test passed");
    } catch (error) {
      console.error("Test failed:", error);
    }
  });
});
