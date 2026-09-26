import type { Address } from "viem";

export const ESCROW_ADDRESS: Address =
  "0x1A8A4ab7d8364b1FBa1D7Bc9744053965d0365c7";

export const escrowAbi = [
  {
    type: "function",
    name: "createEscrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seller", type: "address" },
      { name: "arbiter", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "escrowId", type: "uint256" }],
  },
  {
    type: "event",
    name: "EscrowCreated",
    inputs: [
      {
        indexed: true,
        name: "escrowId",
        type: "uint256",
      },
      {
        indexed: true,
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        name: "arbiter",
        type: "address",
      },
      {
        indexed: false,
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DisputeOpened",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
      },
      {
        name: "initiator",
        type: "address",
        indexed: true,
      },
    ],
  },
  {
    type: "event",
    name: "DisputeResolved",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
      },
      {
        name: "releaseToSeller",
        type: "bool",
        indexed: false,
      },
    ],
  },
  {
    type: "event",
    name: "EscrowFundsTransferred",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
        indexed: true,
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
      },
    ],
  },
  {
    type: "function",
    name: "escrows",
    stateMutability: "view",
    inputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "buyer",
        type: "address",
      },
      {
        name: "seller",
        type: "address",
      },
      {
        name: "arbiter",
        type: "address",
      },
      {
        name: "token",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "state",
        type: "uint8",
      },
    ],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "release",
    stateMutability: "nonpayable",
    inputs: [{ name: "escrowId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "dispute",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveDispute",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "escrowId",
        type: "uint256",
      },
      {
        name: "releaseToSeller",
        type: "bool",
      },
    ],
    outputs: [],
  },
] as const;
