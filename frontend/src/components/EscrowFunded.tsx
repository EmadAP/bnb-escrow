import { useEffect, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";
import EscrowActionDialog from "./EscrowActionDialog";
import { ShieldPlus } from "lucide-react";

type EscrowFundedProps = {
  escrowId: string;
  onEscrowUpdated: (transactionHash?: `0x${string}`) => void;
};

function EscrowFunded({ escrowId, onEscrowUpdated }: EscrowFundedProps) {
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);

  const { address } = useAccount();

  const escrowRole = useAppStore((state) => state.getEscrowRole(address));
  const setView = useAppStore((state) => state.setView);

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

  const {
    writeContract: openDispute,
    data: disputeHash,
    isPending: isOpeningDispute,
    error: disputeError,
    reset: resetDispute,
  } = useWriteContract();

  const {
    isLoading: isConfirmingDispute,
    isSuccess: isDisputeConfirmed,
    isError: isDisputeFailed,
  } = useWaitForTransactionReceipt({
    hash: disputeHash,
  });

  useEffect(() => {
    if (!isReleaseConfirmed || !releaseHash) {
      return;
    }

    onEscrowUpdated(releaseHash);
  }, [isReleaseConfirmed, releaseHash, onEscrowUpdated]);

  useEffect(() => {
    if (!isDisputeConfirmed) {
      return;
    }

    onEscrowUpdated();
  }, [isDisputeConfirmed, onEscrowUpdated]);

  function handleRelease() {
    resetRelease();

    release({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "release",
      args: [BigInt(escrowId)],
    });
  }

  function handleOpenDispute() {
    resetDispute();

    setIsDisputeDialogOpen(false);

    openDispute({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "dispute",
      args: [BigInt(escrowId)],
    });
  }

  const isBuyer = escrowRole === "buyer";
  const isParty = escrowRole === "buyer" || escrowRole === "seller";

  const isReleaseProcessing =
    isReleasing || isConfirmingRelease || isReleaseConfirmed;

  const isDisputeProcessing =
    isOpeningDispute || isConfirmingDispute || isDisputeConfirmed;

  const disputeFailed = disputeError || isDisputeFailed;

  if (!isParty) {
    return (
      <div className="pt-6">
        <div className="flex items-center gap-3">
          <ShieldPlus className="size-6 text-blue-600" />

          <h3 className="font-semibold">Escrow is funded</h3>
        </div>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The funds are held by the escrow contract. The buyer can release the
          funds to the seller, or either party can open a dispute.
        </p>

        <Button
          className="mt-4 w-full"
          variant="default"
          onClick={() => setView("home")}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-6">
      <h3 className="font-semibold">Escrow is funded</h3>

      <p className="text-sm leading-6 text-muted-foreground">
        The funds are held by the escrow contract. The buyer can release the
        funds to the seller, or either party can open a dispute.
      </p>

      <div className="flex flex-col gap-4 md:flex-row">
        {isBuyer && (
          <Button
            className="flex-1"
            size="lg"
            onClick={handleRelease}
            disabled={isReleaseProcessing || isDisputeProcessing}
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

        {isParty && (
          <EscrowActionDialog
            open={isDisputeDialogOpen}
            onOpenChange={setIsDisputeDialogOpen}
            triggerLabel="Open Dispute"
            triggerProcessingLabel={
              isOpeningDispute
                ? "Confirm dispute..."
                : isConfirmingDispute
                  ? "Waiting for confirmation..."
                  : isDisputeConfirmed
                    ? "Dispute opened"
                    : "Open Dispute"
            }
            triggerVariant="outline"
            title="Open dispute?"
            description="This will move the escrow into dispute. The funds will remain locked until the arbiter resolves the dispute."
            confirmLabel="Open Dispute"
            confirmProcessingLabel={
              isOpeningDispute
                ? "Confirm transaction..."
                : isConfirmingDispute
                  ? "Waiting for confirmation..."
                  : "Open Dispute"
            }
            isProcessing={isDisputeProcessing}
            onConfirm={handleOpenDispute}
          />
        )}
      </div>

      {(releaseError || isReleaseFailed) && !isReleaseConfirmed && (
        <p className="text-sm text-destructive">
          Release failed or was rejected.
        </p>
      )}

      {disputeFailed && !isDisputeConfirmed && (
        <p className="text-sm text-destructive">
          Opening the dispute failed or was rejected.
        </p>
      )}
    </div>
  );
}

export default EscrowFunded;
