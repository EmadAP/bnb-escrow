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
import { Button } from "./ui/button";

type EscrowDisputedProps = {
  escrowId: string;
  amount: bigint;
  decimals: number;
  symbol: string;
  onEscrowUpdated: (transactionHash?: `0x${string}`) => void;
};

function EscrowDisputed({
  escrowId,
  amount,
  decimals,
  symbol,
  onEscrowUpdated,
}: EscrowDisputedProps) {
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false);
  const [isBuyerDialogOpen, setIsBuyerDialogOpen] = useState(false);

  const { address } = useAccount();

  const escrowRole = useAppStore((state) => state.getEscrowRole(address));
  const setView = useAppStore((state) => state.setView);

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
    <div className="space-y-4 pt-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="size-6 text-amber-600" />

        <h3 className="font-semibold">Dispute in Progress</h3>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        This escrow has been disputed. The funds remain locked until the
        assigned arbiter resolves the dispute.
      </p>

      {escrowRole === "arbiter" ? (
        <div className="flex flex-col gap-4 md:flex-row">
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
            triggerVariant="outline"
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
        <div>
          <p className="text-sm text-muted-foreground">
            Waiting for the arbiter to resolve the dispute.
          </p>
          <Button
            className="mt-4 w-full"
            variant="default"
            onClick={() => setView("home")}
          >
            Back to Home
          </Button>
        </div>
      )}

      {sellerResolutionFailed && !isSellerResolutionConfirmed && (
        <p className="text-sm text-destructive">
          Releasing the funds to the seller failed or was rejected. Please try
          again.
        </p>
      )}

      {buyerResolutionFailed && !isBuyerResolutionConfirmed && (
        <p className="text-sm text-destructive">
          Refunding the buyer failed or was rejected. Please try again.
        </p>
      )}
    </div>
  );
}

export default EscrowDisputed;
