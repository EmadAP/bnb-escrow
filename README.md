# BNB Escrow

A small decentralized escrow application built to learn Solidity, smart contracts, and EVM application development.

The project consists of a Solidity smart contract and a React-based dApp that allows users to create token-based escrows between a buyer and seller, with an arbiter available to resolve disputes.

The project is built for and deployed to **BNB Smart Chain Testnet**.

## Project Structure

```text
bnb-escrow/

├── escrow/       # Solidity smart contracts and Foundry project
├── frontend/     # React + TypeScript dApp
├── flake.nix     # Nix development environment
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

### Development Environment

- Nix
- pnpm
- Git

## How It Works

The escrow consists of three parties:

- **Buyer** — creates and funds the escrow.
- **Seller** — receives the funds when the escrow is completed.
- **Arbiter** — resolves disputes between the buyer and seller.

The basic lifecycle is:

```text
Created
   │
   │ Buyer deposits tokens
   ▼
Funded
   ├── Buyer releases funds
   │
   │
   └── Buyer or Seller opens dispute
                │
                ▼
             Disputed
                │
                │ Arbiter resolves
                ├── Release to Seller
                │
                └── Refund Buyer
```

## Escrow Workflow

### 1. Create an Escrow

The buyer provides:

- Seller address
- Arbiter address
- Token contract address
- Token amount

The smart contract stores these values and creates a new escrow.

### 2. Approve and Deposit

The buyer approves the escrow contract to spend the selected ERC-20 token and then deposits the required amount.

The tokens are held by the escrow contract.

### 3. Release Funds

If the transaction is completed successfully, the buyer can release the funds.

The escrow contract transfers the tokens to the seller.

### 4. Dispute

If there is a disagreement, either the buyer or seller can open a dispute.

The escrow enters the `Disputed` state.

### 5. Resolve Dispute

The arbiter can resolve the dispute in one of two ways:

- Release the funds to the seller
- Refund the funds to the buyer

## Escrow States

The smart contract uses the following states:

```text
Created
Funded
Disputed
Completed
Refunded
```

State transitions:

```text
Created → Funded → Completed

Created → Funded → Disputed → Completed
                           └──→ Refunded
```

## Smart Contract

The main contract is:

```text
escrow/src/Escrow.sol
```

The project also contains a `MockUSDT` ERC-20 token for development and testing:

```text
escrow/src/MockUSDT.sol
```

### Deployed Contracts

The contracts are deployed on **BNB Smart Chain Testnet**.

| Contract | Address                                      |
| -------- | -------------------------------------------- |
| Escrow   | `0x1A8A4ab7d8364b1FBa1D7Bc9744053965d0365c7` |
| MockUSDT | `0x12DC9bF901F32612057BD664b52287Cf478a9ea6` |

Explorer:

- [BNB Smart Chain Testnet Explorer](https://testnet.bscscan.com/)

## Foundry

[Foundry](https://book.getfoundry.sh/) is used to build, test, format, and deploy the smart contracts.

Foundry provides:

- **Forge** — smart contract testing and build tool
- **Cast** — command-line tool for interacting with EVM chains
- **Anvil** — local EVM development node
- **Chisel** — Solidity REPL

### Build

```shell
cd escrow
forge build
```

### Test

```shell
cd escrow
forge test
```

### Format

```shell
cd escrow
forge fmt
```

### Gas Snapshots

```shell
cd escrow
forge snapshot
```

### Start a Local Node

```shell
cd escrow
anvil
```

### Deploy

Set an RPC endpoint and deployer private key, then run:

```shell
cd escrow

forge script script/Deploy.s.sol \
  --rpc-url <your_rpc_url> \
  --private-key <your_private_key> \
  --broadcast
```

> Never commit a private key or place one directly in the repository.

### Cast

```shell
cast <subcommand>
```

### Help

```shell
forge --help
anvil --help
cast --help
```

## Frontend

The frontend is a single-page decentralized application that interacts directly with the escrow smart contract through the user's wallet.

The frontend supports the main escrow workflow:

- Connect wallet
- Create an escrow
- Open an escrow by ID
- View escrow details
- Approve tokens
- Deposit tokens
- Release funds
- Open disputes
- Resolve disputes as the arbiter
- Display transaction status
- View transaction links

The frontend does not require a traditional application backend for the core dApp functionality.

### Run Locally

```shell
cd frontend
pnpm install
pnpm dev
```

The development server will start on the Vite development port.

### Build

```shell
cd frontend
pnpm build
```

### Preview Production Build

```shell
cd frontend
pnpm preview
```

## Development Environment

The project uses Nix to provide a reproducible development environment.

Enter the development shell with:

```shell
nix develop
```

The development environment provides the tools required for the project, including:

- Node.js
- pnpm
- Foundry
- Git

## Testing

Smart contract tests are located in:

```text
escrow/test/
```

Run the complete Solidity test suite with:

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
- Invalid participants and states

## Project Scope

This project is intentionally small.

The goal is to demonstrate the fundamentals of:

- Solidity development
- ERC-20 token interaction
- Smart contract state management
- Access control
- Events
- Foundry testing
- Contract deployment
- Wallet interaction
- EVM frontend development
- On-chain application architecture

It is a learning and portfolio project rather than a production-ready escrow protocol.

## Known Limitations

- The arbiter is manually selected when an escrow is created.
- There is no decentralized arbitration mechanism.
- There are no platform fees.
- There is no authentication outside of wallet ownership.
- The project currently targets BNB Smart Chain Testnet.
- The included `MockUSDT` token is intended for testing and demonstration.

## License

MIT
