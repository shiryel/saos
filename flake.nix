# https://nixos.wiki/wiki/Flakes

{
  description = "Svelte Animation on Scroll";

  inputs = {
    nixpkgs_stable.url = "github:NixOS/nixpkgs/nixos-21.11";
    nixpkgs_unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs_stable, nixpkgs_unstable, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs_stable { system = system; };
        pkgs_unstable = import nixpkgs_unstable { system = system; };
      in
      {
        devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs_unstable; [
            nodejs
            nodePackages.npm
          ];
        };
      }
    );
}
