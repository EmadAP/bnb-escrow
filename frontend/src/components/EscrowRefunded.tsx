import { CheckCircle2 } from "lucide-react";

type EscrowRefundedProps = {
  escrowId: string;
  buyer: string;
  amount: string;
  symbol: string;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function EscrowRefunded({
  escrowId,
  buyer,
  amount,
  symbol,
}: EscrowRefundedProps) {
  return (
    <div className="border-t pt-6">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-12 text-green-600" />

        <h3 className="mt-4 text-xl font-semibold">Escrow Refunded</h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          The dispute was resolved in favor of the buyer. The escrow funds have
          been returned to the buyer.
        </p>

        <div className="mt-6 w-full border bg-card p-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Escrow</span>

            <span className="text-sm font-medium">#{escrowId}</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Status</span>

            <span className="border border-green-600 px-2 py-0.5 text-xs text-green-700">
              Refunded
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Buyer</span>

            <span className="font-mono text-sm">{shortenAddress(buyer)}</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Amount</span>

            <span className="text-sm font-medium">
              {amount} {symbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EscrowRefunded;
