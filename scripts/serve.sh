#!/usr/bin/env bash
# Serve RustQuest as a static site. Defaults to port 9101; override with $1.
#   ./scripts/serve.sh        # http://localhost:9101
#   ./scripts/serve.sh 8080   # custom port
set -euo pipefail

PORT="${1:-9101}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "RustQuest → http://localhost:${PORT}  (serving ${ROOT})"
cd "$ROOT"
exec python3 -m http.server "$PORT"
