{
  description = "BNB Escrow development environment";

  inputs.nixpkgs.url = "nixpkgs";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              # Smart contract development
              foundry

              # Frontend development
              nodejs_24
              corepack_24

              # Project tools
              git

              # Allows generic Linux binaries to run on NixOS
              steam-run-free
            ];

            shellHook = ''
              echo "Nix Environment Active: bnb-escrow"
              echo "Node: $(node -v)"
              echo "Foundry: $(forge --version | head -n 1)"

              alias pnpm="steam-run pnpm"
            '';
          };
        }
      );
    };
}