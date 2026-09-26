# BNB Escrow

A small decentralized escrow application built to learn and demonstrate Solidity, smart contract development, and EVM application development.

The project implements a token-based escrow between a **buyer** and **seller**, with an **arbiter** responsible for resolving disputes.

The smart contracts are deployed on **BNB Smart Chain Testnet**, and the frontend is publicly deployed using GitHub Pages.

## Live Demo

**[Open the BNB Escrow dApp](https://emadap.github.io/bnb-escrow/)**

## Repository

**[GitHub Repository](https://github.com/EmadAP/bnb-escrow)**

## Network

| Property     | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| Network      | BNB Smart Chain Testnet                                             |
| Chain ID     | `97`                                                                |
| Native Token | `tBNB`                                                              |
| Explorer     | [BscScan Testnet](https://testnet.bscscan.com/)                     |
| Frontend     | [emadap.github.io/bnb-escrow](https://emadap.github.io/bnb-escrow/) |

## Deployed Contracts

### Escrow

```text
0x1A8A4ab7d8364b1FBa1D7Bc9744053965d0365c7
```

[View Escrow Contract on BscScan](https://testnet.bscscan.com/address/0x1A8A4ab7d8364b1FBa1D7Bc9744053965d0365c7)

### MockUSDT

```text
0x12DC9bF901F32612057BD664b52287Cf478a9ea6
```

[View MockUSDT Contract on BscScan](https://testnet.bscscan.com/address/0x12DC9bF901F32612057BD664b52287Cf478a9ea6)

`MockUSDT` is an ERC-20 token deployed for testing and demonstration purposes.

---

## Project Structure

```text
bnb-escrow/

├── .github/
│   └── workflows/
│       ├── test.yml
│       └── deploy-frontend.yml
│
├── escrow/
│   ├── src/        # Solidity smart contracts
│   ├── test/       # Foundry tests
│   ├── script/     # Deployment scripts
│   └── ...
│
├── frontend/
│   ├── src/        # React dApp
│   └── ...
│
├── flake.nix       # Nix development environment
├── README.md
└── .gitignore
```

## Tech Stack

### Smart Contracts

- Solidity
- Foundry
- OpenZeppelin Contracts
- ERC-20 / BEP-20-compatible tokens
- BNB Smart Chain

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- wagmi
- viem
- Zustand
- React Hook Form
- Zod

### Development

- Nix
- pnpm
- GitHub Actions
- GitHub Pages

---

# Escrow Model

The escrow consists of three parties:

- **Buyer** — creates and funds the escrow.
- **Seller** — receives the funds when the escrow is completed.
- **Arbiter** — resolves disputes between the buyer and seller.

The escrow supports the following lifecycle:

```text
Created
   │
   │ Buyer deposits tokens
   ▼
Funded
   ├── Buyer releases funds
   │       │
   │       ▼
   │    Completed
   │
   └── Buyer or Seller opens dispute
               │
               ▼
            Disputed
               │
               │ Arbiter resolves
               ├── Release to Seller
               │       │
               │       ▼
               │    Completed
               │
               └── Refund Buyer
                       │
                       ▼
                    Refunded
```

## Escrow Workflow

### 1. Create Escrow

The buyer provides:

- Seller address
- Arbiter address
- Token contract address
- Token amount

The smart contract stores these values and creates a new escrow.

### 2. Approve and Deposit

The buyer approves the escrow contract to spend the selected ERC-20 token.

The buyer then deposits the required amount.

The tokens are held by the escrow contract.

### 3. Release Funds

When the transaction is completed, the buyer can release the funds.

The escrow contract transfers the tokens to the seller.

### 4. Open a Dispute

If there is a disagreement, either the buyer or seller can open a dispute.

The escrow enters the `Disputed` state.

### 5. Resolve the Dispute

The arbiter can resolve the dispute in either direction:

- Release the funds to the seller
- Refund the funds to the buyer

---

# Smart Contract

The main contract is:

```text
escrow/src/Escrow.sol
```

The project also contains:

```text
escrow/src/MockUSDT.sol
```

`MockUSDT` is an OpenZeppelin ERC-20 implementation used for testing and demonstration.

## Escrow States

The contract uses five states:

```text
Created
Funded
Disputed
Completed
Refunded
```

## Important Contract Concepts

The project demonstrates:

- Solidity structs and enums
- Mappings
- ERC-20 token interaction
- `transferFrom`
- Token allowances
- OpenZeppelin `SafeERC20`
- Access control through `msg.sender`
- Custom errors
- Events
- State transitions
- Contract-to-token interaction
- Deployment with Foundry
- On-chain state verification

---

# Foundry

[Foundry](https://book.getfoundry.sh/) is used to build, test, format, and deploy the smart contracts.

Foundry provides:

- **Forge** — smart contract build and testing
- **Cast** — command-line interaction with EVM contracts
- **Anvil** — local EVM development node
- **Chisel** — Solidity REPL

## Build

```shell
cd escrow
forge build
```

## Test

```shell
cd escrow
forge test
```

## Format

```shell
cd escrow
forge fmt
```

## Gas Snapshot

```shell
cd escrow
forge snapshot
```

## Start Local Node

```shell
cd escrow
anvil
```

## Deploy

The deployment script is:

```text
escrow/script/Deploy.s.sol
```

Example:

```shell
cd escrow

forge script script/Deploy.s.sol \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key> \
  --broadcast
```

> Never commit a private key or place one directly in the repository.

## Cast

```shell
cast <subcommand>
```

---

# Frontend

The frontend is a single-page decentralized application that communicates directly with the deployed smart contract through the user's wallet.

The frontend supports:

- Connect wallet
- Create an escrow
- Open an escrow by ID
- View escrow details
- Detect ERC-20 token metadata
- Approve tokens
- Deposit tokens
- Release funds
- Open disputes
- Resolve disputes as the arbiter
- Display transaction status
- View transaction links on BscScan

The frontend does not require a traditional backend for the core dApp functionality.

## Run Locally

```shell
cd frontend
pnpm install
pnpm dev
```

## Production Build

```shell
cd frontend
pnpm build
```

## Preview Production Build

```shell
cd frontend
pnpm preview
```

---

# CI and Deployment

The repository uses GitHub Actions for automated checks and frontend deployment.

### Smart Contract CI

Every push and pull request runs:

```text
forge fmt --check
forge build --sizes
forge test -vvv
```

### Frontend Deployment

The frontend is automatically built and deployed to GitHub Pages when changes are pushed to `main`.

The deployed application is available at:

**https://emadap.github.io/bnb-escrow/**

---

# Development Environment

The project uses Nix to provide a reproducible development environment.

Enter the development shell with:

```shell
nix develop
```

The environment provides the tools required by the project, including Node.js, pnpm, Foundry, and Git.

---

# Testing

The smart contract tests are located in:

```text
escrow/test/
```

Run the complete test suite with:

```shell
cd escrow
forge test
```

The tests cover the main escrow lifecycle, including:

- Escrow creation
- Token transfers
- Token approvals
- Deposits
- Fund release
- Disputes
- Arbiter resolution
- Refunds
- Invalid participants
- Invalid escrow states

---

# Project Scope

This project is intentionally small and focused.

The goal is to demonstrate practical understanding of:

- Solidity
- Smart contract architecture
- ERC-20 token interactions
- Contract state management
- Access control
- Events
- Custom errors
- Foundry testing
- Contract deployment
- Wallet integration
- EVM frontend development
- On-chain application architecture
- BNB Smart Chain development

This is a learning and portfolio project and is **not intended to be a production-ready escrow protocol**.

---

# Known Limitations

- The arbiter is manually selected when an escrow is created.
- There is no decentralized arbitration mechanism.
- There are no platform fees.
- There is no off-chain identity system.
- The project currently targets BNB Smart Chain Testnet.
- `MockUSDT` is intended only for testing and demonstration.
- The contract has not undergone a professional security audit.

---

# License

MIT
