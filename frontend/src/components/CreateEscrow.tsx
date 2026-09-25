import { useEffect } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseEventLogs, parseUnits } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEscrowSchema,
  type CreateEscrowInput,
} from "@/lib/validation/escrow";
import { useAppStore } from "@/stores/app-store";

import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";

const MOCK_USDT_ADDRESS = "0x12DC9bF901F32612057BD664b52287Cf478a9ea6";

function CreateEscrow() {
  const { address } = useAccount();

  const {
    writeContract,
    data: transactionHash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const setView = useAppStore((state) => state.setView);
  const setEscrowId = useAppStore((state) => state.setEscrowId);
  const setTransactionHash = useAppStore((state) => state.setTransactionHash);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateEscrowInput>({
    resolver: zodResolver(createEscrowSchema),
    defaultValues: {
      seller: "",
      arbiter: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (!transactionHash) {
      return;
    }

    setTransactionHash(transactionHash);
  }, [transactionHash, setTransactionHash]);

  useEffect(() => {
    if (!isConfirmed || !receipt) {
      return;
    }

    const logs = parseEventLogs({
      abi: escrowAbi,
      logs: receipt.logs,
      eventName: "EscrowCreated",
    });

    const createdEvent = logs[0];

    if (!createdEvent) {
      setError("root", {
        message: "Escrow was created, but the escrow ID could not be found.",
      });
      return;
    }

    const escrowId = createdEvent.args.escrowId.toString();

    setEscrowId(escrowId);
    setView("transaction");
  }, [isConfirmed, receipt, setError, setEscrowId, setView]);

  useEffect(() => {
    if (!writeError && !receiptError) {
      return;
    }

    setError("root", {
      message: "The transaction failed or was rejected.",
    });
  }, [writeError, receiptError, setError]);

  function onSubmit(values: CreateEscrowInput) {
    if (!address) {
      return;
    }

    resetWrite();

    const normalizedBuyer = address.toLowerCase();
    const normalizedSeller = values.seller.toLowerCase();
    const normalizedArbiter = values.arbiter.toLowerCase();

    if (normalizedSeller === normalizedBuyer) {
      setError("seller", {
        message: "Seller cannot be the buyer",
      });
      return;
    }

    if (normalizedArbiter === normalizedBuyer) {
      setError("arbiter", {
        message: "Arbiter cannot be the buyer",
      });
      return;
    }

    if (normalizedSeller === normalizedArbiter) {
      setError("arbiter", {
        message: "Arbiter cannot be the seller",
      });
      return;
    }

    const amount = parseUnits(values.amount, 18);

    writeContract({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "createEscrow",
      args: [
        values.seller as `0x${string}`,
        values.arbiter as `0x${string}`,
        MOCK_USDT_ADDRESS,
        amount,
      ],
    });
  }

  const isProcessing = isPending || isConfirming;

  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-16">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Create an Escrow
          </h2>
          <p className="mt-2 text-muted-foreground">
            You will become the buyer for this escrow.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 border bg-card p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="buyer">Buyer</Label>

            <Input
              id="buyer"
              value={address ?? ""}
              readOnly
              placeholder="Connect your wallet"
            />

            {!address && (
              <p className="text-sm text-destructive">
                Connect your wallet to create an escrow.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller">Seller address</Label>

            <Input
              id="seller"
              {...register("seller")}
              placeholder="0x..."
              aria-invalid={Boolean(errors.seller)}
              disabled={isProcessing}
            />

            {errors.seller && (
              <p className="text-sm text-destructive">
                {errors.seller.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="arbiter">Arbiter address</Label>

            <Input
              id="arbiter"
              {...register("arbiter")}
              placeholder="0x..."
              aria-invalid={Boolean(errors.arbiter)}
              disabled={isProcessing}
            />

            {errors.arbiter && (
              <p className="text-sm text-destructive">
                {errors.arbiter.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>

            <Input id="token" value={MOCK_USDT_ADDRESS} readOnly />

            <p className="text-sm text-muted-foreground">
              MockUSDT on BNB Smart Chain Testnet.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>

            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              {...register("amount")}
              placeholder="100"
              aria-invalid={Boolean(errors.amount)}
              disabled={isProcessing}
            />

            {errors.amount ? (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Amount of MockUSDT to place in escrow.
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!address || isProcessing}
          >
            {isPending
              ? "Confirm transaction..."
              : isConfirming
                ? "Waiting for confirmation..."
                : "Create Escrow"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default CreateEscrow;
