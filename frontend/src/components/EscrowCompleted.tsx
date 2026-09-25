import { CheckCircle2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

type EscrowCompletedProps = {
  escrowId: string;
  seller: string;
  amount: string;
  symbol: string;
  releaseHash: `0x${string}`;
};

const BSCSCAN_TESTNET_URL = "https://testnet.bscscan.com";

function EscrowCompleted({
  escrowId,
  seller,
  amount,
  symbol,
  releaseHash,
}: EscrowCompletedProps) {
  const setView = useAppStore((state) => state.setView);

  const transactionUrl = `${BSCSCAN_TESTNET_URL}/tx/${releaseHash}`;

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-12 text-green-600" />

        <h3 className="mt-4 text-xl font-semibold">Escrow Completed</h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The funds have been successfully released to the seller.
        </p>

        <div className="mt-6 w-full border bg-card p-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Escrow</span>
            <span className="text-sm font-medium">#{escrowId}</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Released</span>
            <span className="text-sm font-medium">
              {amount} {symbol}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Seller</span>
            <span className="max-w-45 truncate text-sm font-medium">
              {seller}
            </span>
          </div>

          <div className="mt-3 border-t pt-3">
            <a
              href={transactionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View release transaction
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>

        <Button className="mt-6" onClick={() => setView("home")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default EscrowCompleted;
