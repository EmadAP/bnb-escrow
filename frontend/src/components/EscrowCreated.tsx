import { useEffect } from "react";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Button } from "@/components/ui/button";
import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";
import { erc20Abi } from "@/lib/contracts/erc20";

type EscrowCreatedProps = {
  escrowId: string;
  buyer: string;
  token: `0x${string}`;
  amount: bigint;
  symbol: string;
  formattedAmount: string;
  isCurrentUserBuyer: boolean;
  onEscrowUpdated: () => void;
};

function EscrowCreated({
  escrowId,
  buyer,
  token,
  amount,
  symbol,
  formattedAmount,
  isCurrentUserBuyer,
  onEscrowUpdated,
}: EscrowCreatedProps) {
  const allowanceQuery = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [buyer as `0x${string}`, ESCROW_ADDRESS],
  });

  const {
    writeContract: approve,
    data: approvalHash,
    isPending: isApproving,
    error: approvalError,
    reset: resetApproval,
  } = useWriteContract();

  const {
    isLoading: isConfirmingApproval,
    isSuccess: isApprovalConfirmed,
    isError: isApprovalFailed,
  } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositing,
    error: depositError,
    reset: resetDeposit,
  } = useWriteContract();

  const {
    isLoading: isConfirmingDeposit,
    isSuccess: isDepositConfirmed,
    isError: isDepositFailed,
  } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  useEffect(() => {
    if (!isApprovalConfirmed) {
      return;
    }

    void allowanceQuery.refetch();
  }, [isApprovalConfirmed, allowanceQuery]);

  useEffect(() => {
    if (!isDepositConfirmed) {
      return;
    }

    onEscrowUpdated();
  }, [isDepositConfirmed, onEscrowUpdated]);

  if (!isCurrentUserBuyer) {
    return (
      <div className="border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Only the buyer can fund this escrow.
        </p>
      </div>
    );
  }

  const isApprovalProcessing = isApproving || isConfirmingApproval;
  const isDepositProcessing = isDepositing || isConfirmingDeposit;

  function handleApprove() {
    resetApproval();

    approve({
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [ESCROW_ADDRESS, amount],
    });
  }

  function handleDeposit() {
    resetDeposit();

    deposit({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "deposit",
      args: [BigInt(escrowId)],
    });
  }

  const approvalFailed = approvalError || isApprovalFailed;
  const depositFailed = depositError || isDepositFailed;

  if (allowanceQuery.isLoading) {
    return (
      <div className="border-t pt-6">
        <h3 className="font-semibold">Fund this escrow</h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Checking your token allowance...
        </p>
      </div>
    );
  }

  if (allowanceQuery.isError || allowanceQuery.data === undefined) {
    return (
      <div className="border-t pt-6">
        <h3 className="font-semibold">Fund this escrow</h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We couldn't check your token allowance.
        </p>

        <Button
          className="mt-4 w-full"
          size="lg"
          variant="outline"
          onClick={() => void allowanceQuery.refetch()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const allowance = allowanceQuery.data;
  const hasEnoughAllowance = allowance >= amount;

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold">Fund this escrow</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Approve the escrow contract to spend your {symbol}, then deposit the
        funds into the escrow.
      </p>

      {!hasEnoughAllowance ? (
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={handleApprove}
          disabled={isApprovalProcessing || isDepositProcessing}
        >
          {isApproving
            ? "Confirm approval..."
            : isConfirmingApproval
              ? "Waiting for approval..."
              : `Approve ${formattedAmount} ${symbol}`}
        </Button>
      ) : (
        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={handleDeposit}
          disabled={isDepositProcessing}
        >
          {isDepositing
            ? "Confirm deposit..."
            : isConfirmingDeposit
              ? "Waiting for confirmation..."
              : `Deposit ${formattedAmount} ${symbol}`}
        </Button>
      )}

      {approvalFailed && (
        <p className="mt-3 text-sm text-destructive">
          Approval failed. Please try again.
        </p>
      )}

      {depositFailed && (
        <p className="mt-3 text-sm text-destructive">
          Deposit failed. Please try again.
        </p>
      )}
    </div>
  );
}

export default EscrowCreated;
