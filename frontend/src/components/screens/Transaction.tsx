import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";

const BSC_TESTNET_EXPLORER = "https://testnet.bscscan.com";

function Transaction() {
  const escrowId = useAppStore((state) => state.escrowId);
  const transactionHash = useAppStore((state) => state.transactionHash);
  const setView = useAppStore((state) => state.setView);

  function handleContinue() {
    setView("escrow");
  }

  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-16">
      <div className="w-full max-w-xl">
        <div className="border bg-card p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Escrow Created
            </h2>

            <p className="mt-2 text-muted-foreground">
              Your escrow has been successfully created on BNB Smart Chain
              Testnet.
            </p>
          </div>

          <div className="space-y-4">
            <div className="">
              <p className="text-sm text-muted-foreground">Escrow ID</p>
              <p className="mt-1 text-lg font-semibold">#{escrowId ?? "—"}</p>
            </div>

            <div className="border-b pb-6 ">
              <p className="text-sm text-muted-foreground">Transaction hash</p>

              <p className="mt-1 break-all font-mono text-sm">
                {transactionHash ?? "—"}
              </p>
            </div>

            {transactionHash && (
              <Button asChild variant="outline" className="w-full">
                <a
                  href={`${BSC_TESTNET_EXPLORER}/tx/${transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View transaction <ExternalLink />
                </a>
              </Button>
            )}
          </div>

          <Button className="mt-6 w-full" size="lg" onClick={handleContinue}>
            Continue to Escrow
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Transaction;
