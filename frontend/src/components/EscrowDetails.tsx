import { formatUnits } from "viem";

type EscrowDetailsProps = {
  buyer: string;
  seller: string;
  arbiter: string;
  token: string;
  amount: bigint;
  decimals: number;
  symbol: string;
  stateName: string;
  escrowId: string;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function EscrowDetails({
  buyer,
  seller,
  arbiter,
  token,
  amount,
  decimals,
  symbol,
  stateName,
  escrowId,
}: EscrowDetailsProps) {
  const formattedAmount = formatUnits(amount, decimals);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Escrow #{escrowId}</p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          Escrow Details
        </h2>
      </div>
      <div className="space-y-4 border bg-card p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-muted-foreground">Status</span>

          <span className="border border-primary px-2 py-0.5 text-xs text-primary">
            {stateName}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Buyer</p>
            <p className="mt-1 font-mono text-sm">{shortenAddress(buyer)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Seller</p>
            <p className="mt-1 font-mono text-sm">{shortenAddress(seller)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Arbiter</p>
            <p className="mt-1 font-mono text-sm">{shortenAddress(arbiter)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Token</p>
            <p className="mt-1 font-mono text-sm">{symbol}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">Amount</p>

          <p className="mt-1 text-2xl font-semibold">
            {formattedAmount} {symbol}
          </p>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">Token contract</p>

          <p className="mt-1 break-all font-mono text-sm">{token}</p>
        </div>
      </div>
    </div>
  );
}

export default EscrowDetails;
