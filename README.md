# BNB Escrow

A small decentralized escrow application built to learn Solidity, smart contracts, and EVM application development.

The project contains a Solidity smart contract backend and a React frontend dApp.

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

## Escrow

The project implements a simple escrow flow between:

- Buyer
- Seller
- Arbiter

The buyer creates an escrow with a seller, arbiter, token, and amount.

The buyer can then deposit tokens into the escrow.

After the work is completed, the buyer can release the funds to the seller.

If there is a dispute, the buyer or seller can open a dispute and the arbiter can either:

- Release the funds to the seller
- Refund the buyer

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework.
- **Cast**: Command-line tool for interacting with EVM smart contracts and chain data.
- **Anvil**: Local EVM development node.
- **Chisel**: Solidity REPL.

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

### Anvil

```shell
cd escrow
anvil
```

### Deploy

```shell
cd escrow
forge script script/Deploy.s.sol --rpc-url <your_rpc_url> --private-key <your_private_key>
```

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

The frontend will support the main escrow workflow:

- Connect wallet
- Create escrow
- View escrows
- Approve and deposit tokens
- Release funds
- Open disputes
- Resolve disputes as the arbiter
- Display transaction status and wallet information

The frontend does not require a traditional backend for the core dApp functionality.

## Development Environment

The project uses Nix to provide a reproducible development environment.

Enter the development shell with:

```shell
nix develop
```

The development environment provides the tools required for the project, including Node.js, pnpm, Foundry, and Git.

## License

MIT
