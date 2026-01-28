#!/usr/bin/env bash
set -euo pipefail

# Build Next.js static site to web/out (Next 14 with output: 'export')
cd web
npm ci || npm install
npm run build
cd -

echo "Build completed. Static files are in web/out."