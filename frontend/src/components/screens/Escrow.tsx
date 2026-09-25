import { useCallback, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits, isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { ESCROW_ADDRESS, escrowAbi } from "@/lib/contracts/escrow";
import { erc20Abi } from "@/lib/contracts/erc20";

import EscrowCreated from "../EscrowCreated";
import EscrowDetails from "../EscrowDetails";
import EscrowFunded from "../EscrowFunded";
import EscrowCompleted from "../EscrowCompleted";

const STATES = [
  "Created",
  "Funded",
  "Disputed",
  "Completed",
  "Refunded",
] as const;

function Escrow() {
  const [releaseHash, setReleaseHash] = useState<`0x${string}` | null>(null);
  const { address } = useAccount();

  const escrowId = useAppStore((state) => state.escrowId);
  const setView = useAppStore((state) => state.setView);

  const escrowQuery = useReadContract({
    address: ESCROW_ADDRESS,
    abi: escrowAbi,
    functionName: "escrows",
    args: [BigInt(escrowId ?? "0")],
    query: {
      enabled: escrowId !== null,
    },
  });

  const escrow = escrowQuery.data;

  const tokenQuery = useReadContract({
    address: escrow?.[3],
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      enabled: Boolean(escrow?.[3] && isAddress(escrow[3])),
    },
  });

  const decimalsQuery = useReadContract({
    address: escrow?.[3],
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: Boolean(escrow?.[3] && isAddress(escrow[3])),
    },
  });

  const handleEscrowUpdated = useCallback(() => {
    void escrowQuery.refetch();
  }, [escrowQuery]);

  if (!escrowId) {
    return (
      <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No escrow selected</h2>

          <Button className="mt-6" onClick={() => setView("home")}>
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  if (escrowQuery.isLoading) {
    return (
      <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading escrow...</p>
      </section>
    );
  }

  if (escrowQuery.isError || !escrow) {
    return (
      <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Escrow not found</h2>

          <p className="mt-2 text-muted-foreground">
            We couldn't load escrow #{escrowId}.
          </p>

          <Button className="mt-6" onClick={() => setView("home")}>
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  const [buyer, seller, arbiter, token, amount, state] = escrow;

  if (buyer === "0x0000000000000000000000000000000000000000") {
    return (
      <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Escrow not found</h2>

          <p className="mt-2 text-muted-foreground">
            Escrow #{escrowId} does not exist.
          </p>

          <Button className="mt-6" onClick={() => setView("home")}>
            Back to Home
          </Button>
        </div>
      </section>
    );
  }

  if (tokenQuery.isLoading || decimalsQuery.isLoading) {
    return (
      <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading token details...</p>
      </section>
    );
  }

  if (
    tokenQuery.isError ||
    decimalsQuery.isError ||
    tokenQuery.data === undefined ||
    decimalsQuery.data === undefined
  ) {
    return (
      <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Token details unavailable</h2>

          <p className="mt-2 text-muted-foreground">
            We couldn't load the token details for escrow #{escrowId}.
          </p>

          <Button
            className="mt-6"
            onClick={() => {
              void tokenQuery.refetch();
              void decimalsQuery.refetch();
            }}
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  const decimals = decimalsQuery.data;
  const symbol = tokenQuery.data;
  const formattedAmount = formatUnits(amount, decimals);
  const stateName = STATES[state] ?? "Unknown";

  const isCurrentUserBuyer =
    address !== undefined && address.toLowerCase() === buyer.toLowerCase();

  // const isCurrentUserSeller =
  //   address !== undefined &&
  //   address.toLowerCase() === seller.toLowerCase();

  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-16">
      <div className="w-full max-w-2xl">
        {(state === 0 || state === 1 || state === 2) && (
          <EscrowDetails
            escrowId={escrowId}
            buyer={buyer}
            seller={seller}
            arbiter={arbiter}
            token={token}
            amount={amount}
            decimals={decimals}
            symbol={symbol}
            stateName={stateName}
          />
        )}

        {state === 0 && (
          <EscrowCreated
            escrowId={escrowId}
            buyer={buyer}
            token={token}
            amount={amount}
            symbol={symbol}
            formattedAmount={formattedAmount}
            isCurrentUserBuyer={isCurrentUserBuyer}
            onEscrowUpdated={handleEscrowUpdated}
          />
        )}

        {state === 1 && (
          <EscrowFunded
            escrowId={escrowId}
            isCurrentUserBuyer={isCurrentUserBuyer}
            onEscrowUpdated={(hash) => {
              setReleaseHash(hash);
              void escrowQuery.refetch();
            }}
          />
        )}

        {state === 2 && (
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              This escrow is under dispute.
            </p>
          </div>
        )}

        {state === 3 && releaseHash && (
          <EscrowCompleted
            escrowId={escrowId}
            seller={seller}
            amount={formattedAmount}
            symbol={symbol}
            releaseHash={releaseHash}
          />
        )}

        {state === 4 && (
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              This escrow has been refunded.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Escrow;
