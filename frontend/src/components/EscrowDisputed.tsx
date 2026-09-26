import { useEffect, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits } from "viem";
import { ShieldAlert } from "lucide-react";

import { useAppStore } from "@/stores/app-store";
import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";
import EscrowActionDialog from "./EscrowActionDialog";

type EscrowDisputedProps = {
  escrowId: string;
  arbiter: string;
  amount: bigint;
  decimals: number;
  symbol: string;
  onEscrowUpdated: (transactionHash?: `0x${string}`) => void;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function EscrowDisputed({
  escrowId,
  arbiter,
  amount,
  decimals,
  symbol,
  onEscrowUpdated,
}: EscrowDisputedProps) {
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false);
  const [isBuyerDialogOpen, setIsBuyerDialogOpen] = useState(false);

  const { address } = useAccount();

  const escrowRole = useAppStore((state) => state.getEscrowRole(address));
  const {
    writeContract: releaseToSeller,
    data: sellerResolutionHash,
    isPending: isReleasingToSeller,
    error: sellerResolutionError,
    reset: resetSellerResolution,
  } = useWriteContract();

  const {
    isLoading: isConfirmingSellerResolution,
    isSuccess: isSellerResolutionConfirmed,
    isError: isSellerResolutionFailed,
  } = useWaitForTransactionReceipt({
    hash: sellerResolutionHash,
  });

  const {
    writeContract: refundBuyer,
    data: buyerResolutionHash,
    isPending: isRefundingBuyer,
    error: buyerResolutionError,
    reset: resetBuyerResolution,
  } = useWriteContract();

  const {
    isLoading: isConfirmingBuyerResolution,
    isSuccess: isBuyerResolutionConfirmed,
    isError: isBuyerResolutionFailed,
  } = useWaitForTransactionReceipt({
    hash: buyerResolutionHash,
  });

  const formattedAmount = formatUnits(amount, decimals);

  const isSellerResolutionProcessing =
    isReleasingToSeller ||
    isConfirmingSellerResolution ||
    isSellerResolutionConfirmed;

  const isBuyerResolutionProcessing =
    isRefundingBuyer ||
    isConfirmingBuyerResolution ||
    isBuyerResolutionConfirmed;

  const isProcessing =
    isSellerResolutionProcessing || isBuyerResolutionProcessing;

  useEffect(() => {
    if (!isSellerResolutionConfirmed || !sellerResolutionHash) {
      return;
    }

    onEscrowUpdated(sellerResolutionHash);
  }, [isSellerResolutionConfirmed, sellerResolutionHash, onEscrowUpdated]);

  useEffect(() => {
    if (!isBuyerResolutionConfirmed || !buyerResolutionHash) {
      return;
    }

    onEscrowUpdated(buyerResolutionHash);
  }, [isBuyerResolutionConfirmed, buyerResolutionHash, onEscrowUpdated]);

  function handleReleaseToSeller() {
    resetSellerResolution();

    setIsSellerDialogOpen(false);

    releaseToSeller({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "resolveDispute",
      args: [BigInt(escrowId), true],
    });
  }

  function handleRefundBuyer() {
    resetBuyerResolution();

    setIsBuyerDialogOpen(false);

    refundBuyer({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "resolveDispute",
      args: [BigInt(escrowId), false],
    });
  }

  const sellerResolutionFailed =
    sellerResolutionError || isSellerResolutionFailed;

  const buyerResolutionFailed = buyerResolutionError || isBuyerResolutionFailed;

  return (
    <div className="flex flex-col items-center text-center">
      <ShieldAlert className="size-12 text-amber-500" />

      <h3 className="mt-4 text-xl font-semibold">Dispute in Progress</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        This escrow has been disputed. The funds remain locked until the
        assigned arbiter resolves the dispute.
      </p>

      <div className="mt-6 w-full border bg-card p-4 text-left">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Escrow</span>

          <span className="text-sm font-medium">#{escrowId}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Status</span>

          <span className="border border-amber-500 px-2 py-0.5 text-xs text-amber-600">
            Disputed
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Arbiter</span>

          <span className="font-mono text-sm">{shortenAddress(arbiter)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Amount</span>

          <span className="text-sm font-medium">
            {formattedAmount} {symbol}
          </span>
        </div>
      </div>

      {escrowRole === "arbiter" ? (
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <EscrowActionDialog
            open={isSellerDialogOpen}
            onOpenChange={setIsSellerDialogOpen}
            triggerLabel="Release to Seller"
            triggerProcessingLabel={
              isReleasingToSeller
                ? "Confirm resolution..."
                : isConfirmingSellerResolution
                  ? "Waiting for confirmation..."
                  : isSellerResolutionConfirmed
                    ? "Released to Seller"
                    : "Release to Seller"
            }
            title="Release funds to seller?"
            description="The escrow amount will be transferred to the seller. This decision will resolve the dispute and cannot be reversed."
            amount={formattedAmount}
            symbol={symbol}
            confirmLabel="Confirm Resolution"
            confirmProcessingLabel={
              isReleasingToSeller
                ? "Confirm transaction..."
                : isConfirmingSellerResolution
                  ? "Waiting for confirmation..."
                  : "Confirm Resolution"
            }
            isProcessing={isProcessing}
            onConfirm={handleReleaseToSeller}
          />

          <EscrowActionDialog
            open={isBuyerDialogOpen}
            onOpenChange={setIsBuyerDialogOpen}
            triggerLabel="Refund Buyer"
            triggerProcessingLabel={
              isRefundingBuyer
                ? "Confirm refund..."
                : isConfirmingBuyerResolution
                  ? "Waiting for confirmation..."
                  : isBuyerResolutionConfirmed
                    ? "Refunded to Buyer"
                    : "Refund Buyer"
            }
            triggerVariant="outline"
            title="Refund funds to buyer?"
            description="The escrow amount will be transferred back to the buyer. This decision will resolve the dispute and cannot be reversed."
            amount={formattedAmount}
            symbol={symbol}
            confirmLabel="Confirm Refund"
            confirmProcessingLabel={
              isRefundingBuyer
                ? "Confirm transaction..."
                : isConfirmingBuyerResolution
                  ? "Waiting for confirmation..."
                  : "Confirm Refund"
            }
            isProcessing={isProcessing}
            onConfirm={handleRefundBuyer}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Waiting for the arbiter to resolve the dispute.
        </p>
      )}

      {sellerResolutionFailed && !isSellerResolutionConfirmed && (
        <p className="mt-3 text-sm text-destructive">
          Releasing the funds to the seller failed or was rejected. Please try
          again.
        </p>
      )}

      {buyerResolutionFailed && !isBuyerResolutionConfirmed && (
        <p className="mt-3 text-sm text-destructive">
          Refunding the buyer failed or was rejected. Please try again.
        </p>
      )}
    </div>
  );
}

export default EscrowDisputed;
