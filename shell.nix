with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "Thaumaturgy";

  buildInputs = [
    nodejs
    yarn

    # Needed for node-gyp to build `sqlite3`.
    python2
  ];
}
