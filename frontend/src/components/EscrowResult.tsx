import { CheckCircle2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

type EscrowResultProps = {
  title: string;
  description: string;
  escrowId: string;
  resultLabel: string;
  amount: string;
  symbol: string;
  counterpartyLabel: "Buyer" | "Seller";
  counterparty: string;
  transactionHash?: `0x${string}`;
};

const BSCSCAN_TESTNET_URL = "https://testnet.bscscan.com";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function EscrowResult({
  title,
  description,
  escrowId,
  resultLabel,
  amount,
  symbol,
  counterpartyLabel,
  counterparty,
  transactionHash,
}: EscrowResultProps) {
  const setView = useAppStore((state) => state.setView);

  const transactionUrl = transactionHash
    ? `${BSCSCAN_TESTNET_URL}/tx/${transactionHash}`
    : null;

  return (
    <div className="flex flex-col items-center text-center">
      <CheckCircle2 className="size-12 text-green-600" />

      <h3 className="mt-4 text-xl font-semibold">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 w-full border bg-card p-4 text-left">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Escrow</span>

          <span className="text-sm font-medium">#{escrowId}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">{resultLabel}</span>

          <span className="text-sm font-medium">
            {amount} {symbol}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {counterpartyLabel}
          </span>

          <span className="font-mono text-sm">
            {shortenAddress(counterparty)}
          </span>
        </div>

        {transactionUrl && (
          <div className="mt-3 border-t pt-3">
            <a
              href={transactionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View transaction
              <ExternalLink className="size-4" />
            </a>
          </div>
        )}
      </div>

      <Button className="mt-6" onClick={() => setView("home")}>
        Back to Home
      </Button>
    </div>
  );
}

export default EscrowResult;
