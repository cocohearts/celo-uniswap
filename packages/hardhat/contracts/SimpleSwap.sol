// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.7.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

import "hardhat/console.sol"; // Import Hardhat console

contract SimpleSwap {
    ISwapRouter public immutable swapRouter;
    IQuoter public immutable quoter;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    uint24 public constant feeTier = 3000;

    constructor(ISwapRouter _swapRouter, IQuoter _quoter) {
        swapRouter = _swapRouter;
        quoter = _quoter;
    }

    function swapWETHForDai(
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);

        uint256 amountOutMinimum = quoter.quoteExactInputSingle(
            WETH9,
            DAI,
            feeTier,
            amountIn,
            0
        );

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = swapRouter.exactInputSingle(params);
        console.log("amountOutMinimum: ", amountOutMinimum);
        console.log("amountOut: ", amountOut);
        console.log("diff: ", amountOut - amountOutMinimum);
        // console.log("amountOut:", amountOut); // Print amountOut

        return amountOut;
    }
}
