import { useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAddress, parseEventLogs, parseUnits } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEscrowSchema,
  type CreateEscrowInput,
} from "@/lib/validation/escrow";
import { useAppStore } from "@/stores/app-store";

import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";
import { erc20Abi } from "@/lib/contracts/erc20";

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
    control,
    formState: { errors },
  } = useForm<CreateEscrowInput>({
    resolver: zodResolver(createEscrowSchema),
    defaultValues: {
      seller: "",
      arbiter: "",
      token: MOCK_USDT_ADDRESS,
      amount: "",
    },
  });

  const tokenAddress = useWatch({
    control,
    name: "token",
  });

  const validTokenAddress = isAddress(tokenAddress);

  const {
    data: tokenDecimals,
    isLoading: isLoadingTokenDecimals,
    isError: isTokenError,
  } = useReadContract({
    address: validTokenAddress ? tokenAddress : undefined,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: validTokenAddress,
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

    if (tokenDecimals === undefined) {
      setError("token", {
        message: "The token must be a valid ERC-20 token.",
      });
      return;
    }

    let amount: bigint;

    try {
      amount = parseUnits(values.amount, tokenDecimals);
    } catch {
      setError("amount", {
        message: "Amount has too many decimal places for this token.",
      });
      return;
    }

    writeContract({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "createEscrow",
      args: [
        values.seller as `0x${string}`,
        values.arbiter as `0x${string}`,
        values.token as `0x${string}`,
        amount,
      ],
    });
  }

  const isProcessing = isPending || isConfirming;

  const tokenError =
    errors.token?.message ??
    (validTokenAddress && isTokenError
      ? "Could not read this token. Make sure it is an ERC-20 token on BNB Smart Chain Testnet."
      : undefined);

  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-16">
      <div className="w-full">
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
            <Label htmlFor="token">Token contract</Label>

            <Input
              id="token"
              {...register("token")}
              placeholder="0x..."
              aria-invalid={Boolean(errors.token)}
              disabled={isProcessing}
            />

            {tokenError ? (
              <p className="text-sm text-destructive">{tokenError}</p>
            ) : validTokenAddress && isLoadingTokenDecimals ? (
              <p className="text-sm text-muted-foreground">Checking token...</p>
            ) : tokenDecimals !== undefined ? (
              <p className="text-sm text-muted-foreground">
                ERC-20 token detected · {tokenDecimals} decimals
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enter an ERC-20 token address on BNB Smart Chain Testnet.
              </p>
            )}
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
            ) : tokenDecimals !== undefined ? (
              <p className="text-sm text-muted-foreground">
                Amount of the selected token to place in escrow.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enter a valid ERC-20 token first.
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
            disabled={
              !address ||
              isProcessing ||
              !validTokenAddress ||
              tokenDecimals === undefined ||
              isLoadingTokenDecimals ||
              isTokenError
            }
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
