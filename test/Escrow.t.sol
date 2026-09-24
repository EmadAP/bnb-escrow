// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
import {MockUSDT} from "../src/MockUSDT.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract EscrowTest is Test {
    using SafeERC20 for IERC20;

    Escrow escrow;
    IERC20 token;

    address buyer = makeAddr("buyer");
    address seller = makeAddr("seller");
    address arbiter = makeAddr("arbiter");

    function setUp() public {
        escrow = new Escrow();
        token = new MockUSDT();
    }

    function testCreateEscrow() public {
        vm.expectEmit(true, true, true, true);

        emit Escrow.EscrowCreated(0, address(this), seller, arbiter, address(token), 100 ether);

        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, 100 ether);

        assertEq(escrowId, 0);

        (
            address escrowBuyer,
            address escrowSeller,
            address escrowArbiter,
            IERC20 escrowToken,
            uint256 amount,
            Escrow.State state
        ) = escrow.escrows(escrowId);

        assertEq(escrowBuyer, address(this));
        assertEq(escrowSeller, seller);
        assertEq(escrowArbiter, arbiter);
        assertEq(address(escrowToken), address(token));
        assertEq(amount, 100 ether);
        assertEq(uint256(state), uint256(Escrow.State.Created));
    }

    function testDeposit() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.expectEmit(true, false, false, false);

        emit Escrow.EscrowFunded(escrowId);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        assertEq(token.balanceOf(buyer), 0);
        assertEq(token.balanceOf(address(escrow)), amount);

        (,,,,, Escrow.State state) = escrow.escrows(escrowId);

        assertEq(uint256(state), uint256(Escrow.State.Funded));
    }

    function testRelease() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectEmit(true, true, false, true);

        emit Escrow.EscrowFundsTransferred(escrowId, seller, amount);

        vm.prank(buyer);
        escrow.release(escrowId);

        assertEq(token.balanceOf(address(escrow)), 0);
        assertEq(token.balanceOf(seller), amount);

        (,,,,, Escrow.State state) = escrow.escrows(escrowId);

        assertEq(uint256(state), uint256(Escrow.State.Completed));
    }

    function testOnlyBuyerCanRelease() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectRevert("Not buyer");
        vm.prank(seller);
        escrow.release(escrowId);
    }

    function testBuyerCanDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectEmit(true, true, false, false);

        emit Escrow.DisputeOpened(escrowId, buyer);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        (,,,,, Escrow.State state) = escrow.escrows(escrowId);

        assertEq(uint256(state), uint256(Escrow.State.Disputed));
    }

    function testSellerCanDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectEmit(true, true, false, false);

        emit Escrow.DisputeOpened(escrowId, seller);

        vm.prank(seller);
        escrow.dispute(escrowId);

        (,,,,, Escrow.State state) = escrow.escrows(escrowId);

        assertEq(uint256(state), uint256(Escrow.State.Disputed));
    }

    function testArbiterCanReleaseAfterDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.expectEmit(true, true, false, true);

        emit Escrow.EscrowFundsTransferred(escrowId, seller, amount);

        vm.expectEmit(true, false, false, true);

        emit Escrow.DisputeResolved(escrowId, true);

        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, true);

        assertEq(token.balanceOf(address(escrow)), 0);
        assertEq(token.balanceOf(seller), amount);

        (,,,,, Escrow.State state) = escrow.escrows(escrowId);

        assertEq(uint256(state), uint256(Escrow.State.Completed));
    }

    function testArbiterCanRefundBuyerAfterDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.expectEmit(true, true, false, true);

        emit Escrow.EscrowFundsTransferred(escrowId, buyer, amount);

        vm.expectEmit(true, false, false, true);

        emit Escrow.DisputeResolved(escrowId, false);

        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, false);

        assertEq(token.balanceOf(address(escrow)), 0);
        assertEq(token.balanceOf(buyer), amount);

        (,,,,, Escrow.State state) = escrow.escrows(escrowId);

        assertEq(uint256(state), uint256(Escrow.State.Refunded));
    }

    function testOnlyArbiterCanResolveDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.expectRevert("Not arbiter");
        vm.prank(buyer);
        escrow.resolveDispute(escrowId, true);
    }

    function testCannotReleaseBeforeDeposit() public {
        uint256 amount = 100 ether;

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.expectRevert("Invalid state");
        vm.prank(buyer);
        escrow.release(escrowId);
    }

    function testCannotDepositTwice() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectRevert("Invalid state");
        vm.prank(buyer);
        escrow.deposit(escrowId);
    }

    function testCannotDisputeBeforeDeposit() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, 100 ether);

        vm.expectRevert("Invalid state");
        vm.prank(buyer);
        escrow.dispute(escrowId);
    }

    function testCannotCreateEscrowWithZeroSeller() public {
        vm.expectRevert("Invalid seller");

        escrow.createEscrow(address(0), arbiter, token, 100 ether);
    }

    function testCannotCreateEscrowWithZeroArbiter() public {
        vm.expectRevert("Invalid arbiter");

        escrow.createEscrow(seller, address(0), token, 100 ether);
    }

    function testCannotCreateEscrowWithZeroToken() public {
        vm.expectRevert("Invalid token");

        escrow.createEscrow(seller, arbiter, IERC20(address(0)), 100 ether);
    }

    function testCannotCreateEscrowWithZeroAmount() public {
        vm.expectRevert("Invalid amount");

        escrow.createEscrow(seller, arbiter, token, 0);
    }

    function testCannotCreateEscrowWithBuyerAsSeller() public {
        vm.expectRevert("Buyer cannot be seller");

        escrow.createEscrow(address(this), arbiter, token, 100 ether);
    }

    function testCannotCreateEscrowWithBuyerAsArbiter() public {
        vm.expectRevert("Buyer cannot be arbiter");

        escrow.createEscrow(seller, address(this), token, 100 ether);
    }

    function testCannotCreateEscrowWithSellerAsArbiter() public {
        vm.expectRevert("Seller cannot be arbiter");

        escrow.createEscrow(seller, seller, token, 100 ether);
    }

    function testOnlyBuyerCanDeposit() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.expectRevert("Not buyer");
        vm.prank(seller);
        escrow.deposit(escrowId);
    }

    function testArbiterCannotRelease() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectRevert("Not buyer");
        vm.prank(arbiter);
        escrow.release(escrowId);
    }

    function testOnlyBuyerOrSellerCanDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectRevert("Not party");
        vm.prank(arbiter);
        escrow.dispute(escrowId);
    }

    function testSellerCannotResolveDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.expectRevert("Not arbiter");
        vm.prank(seller);
        escrow.resolveDispute(escrowId, true);
    }

    function testCannotReleaseAfterDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.expectRevert("Invalid state");
        vm.prank(buyer);
        escrow.release(escrowId);
    }

    function testCannotDepositAfterDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.expectRevert("Invalid state");
        vm.prank(buyer);
        escrow.deposit(escrowId);
    }

    function testCannotDisputeAfterCompletion() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.release(escrowId);

        vm.expectRevert("Invalid state");
        vm.prank(buyer);
        escrow.dispute(escrowId);
    }

    function testCannotResolveBeforeDispute() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.expectRevert("Invalid state");
        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, true);
    }

    function testCannotResolveDisputeTwice() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, true);

        vm.expectRevert("Invalid state");
        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, false);
    }

    function testMultipleEscrowsAreIndependent() public {
        uint256 firstAmount = 100 ether;
        uint256 secondAmount = 200 ether;

        address buyer2 = makeAddr("buyer2");
        address seller2 = makeAddr("seller2");
        address arbiter2 = makeAddr("arbiter2");

        token.safeTransfer(buyer, firstAmount);
        token.safeTransfer(buyer2, secondAmount);

        vm.prank(buyer);
        uint256 firstEscrowId = escrow.createEscrow(seller, arbiter, token, firstAmount);

        vm.prank(buyer2);
        uint256 secondEscrowId = escrow.createEscrow(seller2, arbiter2, token, secondAmount);

        vm.prank(buyer);
        token.approve(address(escrow), firstAmount);

        vm.prank(buyer2);
        token.approve(address(escrow), secondAmount);

        vm.prank(buyer);
        escrow.deposit(firstEscrowId);

        assertEq(token.balanceOf(address(escrow)), firstAmount);

        (,,,,, Escrow.State firstState) = escrow.escrows(firstEscrowId);
        (,,,,, Escrow.State secondState) = escrow.escrows(secondEscrowId);

        assertEq(uint256(firstState), uint256(Escrow.State.Funded));
        assertEq(uint256(secondState), uint256(Escrow.State.Created));

        vm.prank(buyer2);
        escrow.deposit(secondEscrowId);

        assertEq(token.balanceOf(address(escrow)), firstAmount + secondAmount);

        vm.prank(buyer);
        escrow.release(firstEscrowId);

        assertEq(token.balanceOf(seller), firstAmount);
        assertEq(token.balanceOf(seller2), 0);

        (,,,,, firstState) = escrow.escrows(firstEscrowId);
        (,,,,, secondState) = escrow.escrows(secondEscrowId);

        assertEq(uint256(firstState), uint256(Escrow.State.Completed));
        assertEq(uint256(secondState), uint256(Escrow.State.Funded));

        assertEq(token.balanceOf(address(escrow)), secondAmount);
    }

    function testCannotDisputeAfterRefund() public {
        uint256 amount = 100 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.prank(buyer);
        escrow.deposit(escrowId);

        vm.prank(buyer);
        escrow.dispute(escrowId);

        vm.prank(arbiter);
        escrow.resolveDispute(escrowId, false);

        vm.expectRevert("Invalid state");
        vm.prank(buyer);
        escrow.dispute(escrowId);
    }

    function testCannotDepositWithInsufficientAllowance() public {
        uint256 amount = 100 ether;
        uint256 allowance = 50 ether;

        token.safeTransfer(buyer, amount);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), allowance);

        vm.expectRevert();
        vm.prank(buyer);
        escrow.deposit(escrowId);
    }

    function testCannotDepositWithInsufficientBalance() public {
        uint256 amount = 100 ether;
        uint256 buyerBalance = 50 ether;

        token.safeTransfer(buyer, buyerBalance);

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow(seller, arbiter, token, amount);

        vm.prank(buyer);
        token.approve(address(escrow), amount);

        vm.expectRevert();
        vm.prank(buyer);
        escrow.deposit(escrowId);
    }
}
