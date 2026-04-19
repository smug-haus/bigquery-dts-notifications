#!/usr/bin/env bash
# Post-create setup for the Formal Methods course devcontainer.
# Installs elan (Lean version manager) and builds the fmcourse CLI.

set -euo pipefail

# Install elan if it isn't already on PATH.
if ! command -v elan >/dev/null 2>&1; then
  curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh \
    | sh -s -- -y --default-toolchain none
fi

# shellcheck disable=SC1091
source "$HOME/.profile" 2>/dev/null || true
export PATH="$HOME/.elan/bin:$PATH"

# Install the toolchain pinned by lean-toolchain, if present.
if [ -f lean-toolchain ]; then
  elan toolchain install "$(cat lean-toolchain)"
fi

# Build the fmcourse CLI (Node 22 is installed by the devcontainer feature).
pushd tools/fmcourse >/dev/null
npm ci || npm install
npm run build
popd >/dev/null

echo "Devcontainer setup complete."
echo "Try: node tools/fmcourse/dist/src/cli.js --help"
