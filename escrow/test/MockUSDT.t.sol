// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract MockUSDTTest is Test {
    using SafeERC20 for IERC20;

    uint256 internal constant TRANSFER_AMOUNT = 100 ether;
    uint256 internal constant ALLOWANCE_AMOUNT = 50 ether;

    IERC20 token;

    address buyer;
    address seller;

    function setUp() public {
        buyer = makeAddr("buyer");
        seller = makeAddr("seller");

        token = new MockUSDT();
    }

    function testInitialSupply() public view {
        assertEq(token.balanceOf(address(this)), 1_000_000 ether);
    }

    function testTransfer() public {
        token.safeTransfer(buyer, TRANSFER_AMOUNT);

        assertEq(token.balanceOf(buyer), TRANSFER_AMOUNT);
        assertEq(token.balanceOf(address(this)), 999_900 ether);
    }

    function testApproveAndTransferFrom() public {
        token.safeTransfer(buyer, TRANSFER_AMOUNT);

        vm.prank(buyer);
        assertTrue(token.approve(address(this), ALLOWANCE_AMOUNT));

        assertEq(token.allowance(buyer, address(this)), ALLOWANCE_AMOUNT);

        token.safeTransferFrom(buyer, seller, ALLOWANCE_AMOUNT);

        assertEq(token.balanceOf(buyer), ALLOWANCE_AMOUNT);
        assertEq(token.balanceOf(seller), ALLOWANCE_AMOUNT);
    }
}
