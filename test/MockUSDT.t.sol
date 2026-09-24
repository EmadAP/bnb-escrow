// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract MockUSDTTest is Test {
    using SafeERC20 for IERC20;

    IERC20 token;

    address buyer = makeAddr("buyer");
    address seller = makeAddr("seller");

    function setUp() public {
        token = new MockUSDT();
    }

    function testInitialSupply() public {
        assertEq(token.balanceOf(address(this)), 1_000_000 ether);
    }

    function testTransfer() public {
        token.safeTransfer(buyer, 100 ether);

        assertEq(token.balanceOf(buyer), 100 ether);
        assertEq(token.balanceOf(address(this)), 999_900 ether);
    }

    function testApproveAndTransferFrom() public {
        token.safeTransfer(buyer, 100 ether);

        vm.prank(buyer);
        token.approve(address(this), 50 ether);

        assertEq(token.allowance(buyer, address(this)), 50 ether);

        token.safeTransferFrom(buyer, seller, 50 ether);

        assertEq(token.balanceOf(buyer), 50 ether);
        assertEq(token.balanceOf(seller), 50 ether);
    }
}
