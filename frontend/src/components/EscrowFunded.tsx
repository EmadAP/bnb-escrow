import { useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { Button } from "@/components/ui/button";
import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";

type EscrowFundedProps = {
  escrowId: string;
  isCurrentUserBuyer: boolean;
  onEscrowUpdated: (releaseHash: `0x${string}`) => void;
};

function EscrowFunded({
  escrowId,
  isCurrentUserBuyer,
  onEscrowUpdated,
}: EscrowFundedProps) {
  const {
    writeContract: release,
    data: releaseHash,
    isPending: isReleasing,
    error: releaseError,
    reset: resetRelease,
  } = useWriteContract();

  const {
    isLoading: isConfirmingRelease,
    isSuccess: isReleaseConfirmed,
    isError: isReleaseFailed,
  } = useWaitForTransactionReceipt({
    hash: releaseHash,
  });

  useEffect(() => {
    if (!isReleaseConfirmed || !releaseHash) {
      return;
    }

    onEscrowUpdated(releaseHash);
  }, [isReleaseConfirmed, releaseHash, onEscrowUpdated]);

  function handleRelease() {
    resetRelease();

    release({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "release",
      args: [BigInt(escrowId)],
    });
  }

  const isProcessing = isReleasing || isConfirmingRelease || isReleaseConfirmed;

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold">Escrow is funded</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        The funds are held by the escrow contract. The buyer can release the
        funds to the seller, or either party can open a dispute.
      </p>

      {isCurrentUserBuyer && (
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={handleRelease}
          disabled={isProcessing}
        >
          {isReleasing
            ? "Confirm release..."
            : isConfirmingRelease
              ? "Waiting for confirmation..."
              : isReleaseConfirmed
                ? "Release completed"
                : "Release Funds"}
        </Button>
      )}

      {(releaseError || isReleaseFailed) && !isReleaseConfirmed && (
        <p className="mt-3 text-sm text-destructive">
          Release failed or was rejected.
        </p>
      )}
    </div>
  );
}

export default EscrowFunded;
