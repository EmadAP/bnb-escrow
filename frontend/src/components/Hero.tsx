import { ArrowRight, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { useAppStore } from "@/stores/app-store";
import {
  openEscrowSchema,
  type OpenEscrowInput,
} from "@/lib/validation/escrow";

function Hero() {
  const { isConnected } = useAccount();

  const setView = useAppStore((state) => state.setView);
  const setEscrowId = useAppStore((state) => state.setEscrowId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpenEscrowInput>({
    resolver: zodResolver(openEscrowSchema),
    defaultValues: {
      escrowId: "",
    },
  });

  function onSubmit(values: OpenEscrowInput) {
    setEscrowId(values.escrowId);
    setView("escrow");
  }

  return (
    <section className="flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-16">
      <div className="w-full max-w-3xl text-center">
        <h2 className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl lg:text-6xl">
          Simple, transparent <br /> <span className="text-primary">BNB</span>{" "}
          Escrow
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Hold BEP-20 tokens securely between a buyer and seller. Funds are
          released when the buyer approves the transaction, or resolved by an
          arbiter when a dispute occurs.
        </p>

        <div className="mt-10 flex flex-col items-center gap-10">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={!isConnected}
            onClick={() => setView("create")}
          >
            Create an Escrow <ArrowRight />
          </Button>

          <div className="flex w-full max-w-sm items-center gap-3 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <InputGroup>
              <InputGroupInput
                {...register("escrowId")}
                placeholder="Open Existing Escrow"
                aria-label="Escrow ID"
                aria-invalid={errors.escrowId ? "true" : "false"}
              />

              <InputGroupAddon align="inline-end">
                <Button
                  type="submit"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Open escrow"
                >
                  <Search className="text-primary" />
                </Button>
              </InputGroupAddon>
            </InputGroup>

            {errors.escrowId && (
              <p className="mt-2 text-left text-sm text-destructive">
                {errors.escrowId.message}
              </p>
            )}
          </form>
        </div>

        <div className="mx-auto mt-14 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">Buyer protected</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Funds stay in the escrow until the agreed outcome.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">On-chain</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Escrow state and funds are controlled by a smart contract.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">Dispute resolution</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              An assigned arbiter can resolve disputed funds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
