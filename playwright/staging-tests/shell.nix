let
  nixpkgs = builtins.fetchTarball "https://github.com/NixOS/nixpkgs/archive/9665f56e3b9c0bfaa07ca88b03b62bb277678a23.tar.gz";
  pkgs = import nixpkgs { config = { }; overlays = [ ]; };
in
with pkgs;
mkShell {
  buildInputs = [
    nodejs
    playwright-test
    # python311Packages.playwright
    # python311Packages.pytest
  ];

  PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}";

  shellHook = ''
    # Remove playwright from node_modules, so it will be taken from playwright-test
    rm node_modules/@playwright/ -R
    export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
    export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
  '';
}
