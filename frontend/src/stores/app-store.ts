import { create } from "zustand";

export type AppView = "home" | "create" | "transaction" | "escrow";

type AppState = {
  view: AppView;
  escrowId: string | null;
  transactionHash: string | null;

  setView: (view: AppView) => void;
  setEscrowId: (escrowId: string | null) => void;
  setTransactionHash: (transactionHash: string | null) => void;
  reset: () => void;
};

const initialState = {
  view: "home" as AppView,
  escrowId: null,
  transactionHash: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setView: (view) => set({ view }),
  setEscrowId: (escrowId) => set({ escrowId }),
  setTransactionHash: (transactionHash) => set({ transactionHash }),
  reset: () => set(initialState),
}));
