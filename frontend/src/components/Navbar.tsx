import { useAccount, useConnect, useDisconnect } from "wagmi";

import Container from "./Container";
import { Button } from "@/components/ui/button";
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

  return (
    <nav className="h-18 border-b border-border">
      <Container className="flex h-full flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          <span className="text-primary">BNB</span> Escrow
        </h1>

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

              <DropdownMenuItem
                variant="destructive"
                onClick={() => disconnect()}
                className="flex items-center justify-between"
              >
                <span>Disconnect</span>
                <LogOut />
              </DropdownMenuItem>
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
