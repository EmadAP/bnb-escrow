import { CheckCircle2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

type EscrowResultProps = {
  title: string;
  description: string;
  transactionHash?: `0x${string}`;
};

const BSCSCAN_TESTNET_URL = "https://testnet.bscscan.com";

function EscrowResult({
  title,
  description,
  transactionHash,
}: EscrowResultProps) {
  const setView = useAppStore((state) => state.setView);

  const transactionUrl = transactionHash
    ? `${BSCSCAN_TESTNET_URL}/tx/${transactionHash}`
    : null;

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-6 text-green-600" />

        <h3 className="font-semibold">{title}</h3>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">{description}</p>

      <div className="flex flex-col gap-4 md:flex-row">
        {transactionUrl && (
          <Button className="flex-1" size="lg" variant="outline" asChild>
            <a href={transactionUrl} target="_blank" rel="noreferrer">
              View Transaction
              <ExternalLink className="size-4" />
            </a>
          </Button>
        )}

        <Button className="flex-1" size="lg" onClick={() => setView("home")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default EscrowResult;
