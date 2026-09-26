import { useEffect, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";

type EscrowFundedProps = {
  escrowId: string;
  seller: string;
  isCurrentUserBuyer: boolean;
  onEscrowUpdated: (transactionHash?: `0x${string}`) => void;
};

function EscrowFunded({
  escrowId,
  isCurrentUserBuyer,
  onEscrowUpdated,
  seller,
}: EscrowFundedProps) {
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);

  const { address } = useAccount();

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

  const isCurrentUserSeller =
    address !== undefined && address.toLowerCase() === seller.toLowerCase();

  const isReleaseProcessing =
    isReleasing || isConfirmingRelease || isReleaseConfirmed;

  const isDisputeProcessing =
    isOpeningDispute || isConfirmingDispute || isDisputeConfirmed;

  const disputeFailed = disputeError || isDisputeFailed;

  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="font-semibold">Escrow is funded</h3>

      <p className="text-sm leading-6 text-muted-foreground">
        The funds are held by the escrow contract. The buyer can release the
        funds to the seller, or either party can open a dispute.
      </p>

      <div className="flex flex-col gap-4 md:flex-row">
        {isCurrentUserBuyer && (
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

        {(isCurrentUserBuyer || isCurrentUserSeller) && (
          <Dialog
            open={isDisputeDialogOpen}
            onOpenChange={setIsDisputeDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="flex-1"
                size="lg"
                variant="outline"
                disabled={isReleaseProcessing || isDisputeProcessing}
              >
                {isOpeningDispute
                  ? "Confirm dispute..."
                  : isConfirmingDispute
                    ? "Waiting for confirmation..."
                    : isDisputeConfirmed
                      ? "Dispute opened"
                      : "Open Dispute"}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open dispute?</DialogTitle>

                <DialogDescription>
                  This will move the escrow into dispute. The funds will remain
                  locked until the arbiter resolves the dispute.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDisputeDialogOpen(false)}
                  disabled={isDisputeProcessing}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleOpenDispute}
                  disabled={isDisputeProcessing}
                >
                  {isOpeningDispute
                    ? "Confirm transaction..."
                    : isConfirmingDispute
                      ? "Waiting for confirmation..."
                      : "Open Dispute"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
