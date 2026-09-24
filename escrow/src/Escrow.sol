// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Escrow {
    using SafeERC20 for IERC20;

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        address arbiter,
        address token,
        uint256 amount
    );

    event EscrowFunded(uint256 indexed escrowId);

    event EscrowFundsTransferred(uint256 indexed escrowId, address indexed recipient, uint256 amount);

    event DisputeOpened(uint256 indexed escrowId, address indexed initiator);

    event DisputeResolved(uint256 indexed escrowId, bool releaseToSeller);

    enum State {
        Created,
        Funded,
        Disputed,
        Completed,
        Refunded
    }

    struct EscrowData {
        address buyer;
        address seller;
        address arbiter;
        IERC20 token;
        uint256 amount;
        State state;
    }

    uint256 public nextEscrowId;

    mapping(uint256 => EscrowData) public escrows;

    function createEscrow(address seller, address arbiter, IERC20 token, uint256 amount)
        external
        returns (uint256 escrowId)
    {
        require(seller != address(0), "Invalid seller");
        require(arbiter != address(0), "Invalid arbiter");
        require(address(token) != address(0), "Invalid token");
        require(amount > 0, "Invalid amount");
        require(seller != msg.sender, "Buyer cannot be seller");
        require(arbiter != msg.sender, "Buyer cannot be arbiter");
        require(arbiter != seller, "Seller cannot be arbiter");

        escrowId = nextEscrowId++;

        escrows[escrowId] = EscrowData({
            buyer: msg.sender, seller: seller, arbiter: arbiter, token: token, amount: amount, state: State.Created
        });

        emit EscrowCreated(escrowId, msg.sender, seller, arbiter, address(token), amount);
    }

    function deposit(uint256 escrowId) external {
        EscrowData storage escrow = escrows[escrowId];

        require(msg.sender == escrow.buyer, "Not buyer");
        require(escrow.state == State.Created, "Invalid state");

        escrow.token.safeTransferFrom(escrow.buyer, address(this), escrow.amount);

        escrow.state = State.Funded;

        emit EscrowFunded(escrowId);
    }

    function release(uint256 escrowId) external {
        EscrowData storage escrow = escrows[escrowId];

        require(msg.sender == escrow.buyer, "Not buyer");
        require(escrow.state == State.Funded, "Invalid state");

        escrow.token.safeTransfer(escrow.seller, escrow.amount);

        escrow.state = State.Completed;

        emit EscrowFundsTransferred(escrowId, escrow.seller, escrow.amount);
    }

    function dispute(uint256 escrowId) external {
        EscrowData storage escrow = escrows[escrowId];

        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Not party");
        require(escrow.state == State.Funded, "Invalid state");

        escrow.state = State.Disputed;

        emit DisputeOpened(escrowId, msg.sender);
    }

    function resolveDispute(uint256 escrowId, bool releaseToSeller) external {
        EscrowData storage escrow = escrows[escrowId];

        require(msg.sender == escrow.arbiter, "Not arbiter");
        require(escrow.state == State.Disputed, "Invalid state");

        if (releaseToSeller) {
            escrow.token.safeTransfer(escrow.seller, escrow.amount);
            escrow.state = State.Completed;

            emit EscrowFundsTransferred(escrowId, escrow.seller, escrow.amount);
        } else {
            escrow.token.safeTransfer(escrow.buyer, escrow.amount);
            escrow.state = State.Refunded;

            emit EscrowFundsTransferred(escrowId, escrow.buyer, escrow.amount);
        }

        emit DisputeResolved(escrowId, releaseToSeller);
    }
}
