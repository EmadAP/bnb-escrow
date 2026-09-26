import { create } from "zustand";
import type { Address } from "viem";

export type AppView = "home" | "create" | "transaction" | "escrow";

export type EscrowRole =
  | "buyer"
  | "seller"
  | "arbiter"
  | "random"
  | "disconnected";

export type EscrowParticipants = {
  buyer: Address;
  seller: Address;
  arbiter: Address;
};

type AppState = {
  view: AppView;
  escrowId: string | null;
  transactionHash: string | null;
  escrowParticipants: EscrowParticipants | null;

  setView: (view: AppView) => void;
  setEscrowId: (escrowId: string | null) => void;
  setTransactionHash: (transactionHash: string | null) => void;
  setEscrowParticipants: (participants: EscrowParticipants | null) => void;

  getEscrowRole: (address?: Address) => EscrowRole;

  reset: () => void;
};

const initialState = {
  view: "home" as AppView,
  escrowId: null,
  transactionHash: null,
  escrowParticipants: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  setView: (view) => set({ view }),

  setEscrowId: (escrowId) => set({ escrowId }),

  setTransactionHash: (transactionHash) => set({ transactionHash }),

  setEscrowParticipants: (escrowParticipants) => set({ escrowParticipants }),

  getEscrowRole: (address) => {
    if (!address) {
      return "disconnected";
    }

    const participants = get().escrowParticipants;

    if (!participants) {
      return "random";
    }

    const connectedAddress = address.toLowerCase();

    if (connectedAddress === participants.buyer.toLowerCase()) {
      return "buyer";
    }

    if (connectedAddress === participants.seller.toLowerCase()) {
      return "seller";
    }

    if (connectedAddress === participants.arbiter.toLowerCase()) {
      return "arbiter";
    }

    return "random";
  },

  reset: () => set(initialState),
}));
