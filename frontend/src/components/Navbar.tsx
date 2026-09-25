import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useAppStore } from "@/stores/app-store";

import Container from "./Container";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, LogOut } from "lucide-react";

function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const reset = useAppStore((state) => state.reset);

  function handleConnect() {
    const connector = connectors[0];

    if (!connector) {
      return;
    }

    connect({ connector });
  }

  function handleCopyAddress() {
    if (!address) {
      return;
    }

    void navigator.clipboard.writeText(address);
  }

  function handleDisconnect() {
    disconnect();
    reset();
  }

  return (
    <nav className="h-18 border-b border-border">
      <Container className="flex h-full flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={reset}
          className="text-3xl font-bold"
          aria-label="Go to home"
        >
          <span className="text-primary">BNB</span> Escrow
        </button>

        {isConnected && address ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="text-lg">
                {address.slice(0, 6)}...{address.slice(-4)}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleCopyAddress}
                className="flex items-center justify-between"
              >
                <span>Copy address</span>
                <Copy />
              </DropdownMenuItem>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(event) => event.preventDefault()}
                    className="flex items-center justify-between"
                  >
                    <span>Disconnect</span>
                    <LogOut />
                  </DropdownMenuItem>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect wallet?</AlertDialogTitle>

                    <AlertDialogDescription>
                      You will be disconnected from your wallet and your current
                      escrow flow will be cleared. You will be returned to the
                      home screen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                    <AlertDialogAction onClick={handleDisconnect}>
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button className="text-lg" onClick={handleConnect}>
            Connect
          </Button>
        )}
      </Container>
    </nav>
  );
}

export default Navbar;
