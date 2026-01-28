#!/usr/bin/env bash
set -euo pipefail

# Cleanup emojis and non-ASCII symbols across common text-based files.
# Replaces them with ASCII equivalents to enforce "no emoji/non-ASCII" policy.
# Usage: ./scripts/cleanup-nonascii.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# File globs considered text; exclude binary/build/vendor dirs
FILTER="( -name '*.md' -o -name '*.mdx' -o -name '*.txt' -o -name '*.yml' -o -name '*.yaml' -o -name '*.json' -o -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.css' -o -name '*.scss' -o -name '*.xaml' -o -name '*.cs' -o -name '*.ps1' -o -name '*.sh' )"
EXCLUDES="-not -path './.git/*' -not -path './node_modules/*' -not -path './publish/*' -not -path './.next/*' -not -path './dist/*' -not -path './build/*'"

# Perl replacement map: add as needed
PERL_MAP=(
  # Check/cross marks
  "s/\x{2713}/PASS/g"   # ✓
  "s/\x{2714}/PASS/g"   # ✔
  "s/\x{2717}/FAIL/g"   # ✗
  "s/\x{274C}/FAIL/g"   # ❌

  # Arrows
  "s/\x{2190}/<-/g"     # ←
  "s/\x{2192}/->/g"     # →
  "s/\x{2191}/^/g"      # ↑
  "s/\x{2193}/v/g"      # ↓

  # Bullets and dots
  "s/\x{2022}/-/g"      # •
  "s/\x{25CF}/-/g"      # ●
  "s/\x{00B7}/-/g"      # ·

  # Box drawing and lines
  "s/[\x{2500}\x{2014}\x{2013}]/-/g"   # ─, —, –
  "s/[\x{250C}\x{2510}\x{2514}\x{2518}]/+/g" # ┌┐└┘
  "s/\x{2502}/|/g"       # │

  # Triangles
  "s/\x{25BC}/v/g"       # ▼
  "s/\x{25B2}/^/g"       # ▲

  # Spaces and ellipsis
  "s/\x{00A0}/ /g"       # NBSP -> space
  "s/\x{2026}/.../g"     # …

  # Replacement character
  "s/\x{FFFD}//g"        # �
)

PERL_EXPR=$(IFS=';'; echo "${PERL_MAP[*]};")

echo "Cleaning non-ASCII symbols in repository: $ROOT_DIR"
# shellcheck disable=SC2046
# Use find with properly escaped parentheses; avoid eval to prevent syntax issues
# shellcheck disable=SC2154
find . -type f \( -name '*.md' -o -name '*.mdx' -o -name '*.txt' -o -name '*.yml' -o -name '*.yaml' -o -name '*.json' -o -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.css' -o -name '*.scss' -o -name '*.xaml' -o -name '*.cs' -o -name '*.ps1' -o -name '*.sh' \) \
  -not -path './.git/*' -not -path './node_modules/*' -not -path './publish/*' -not -path './.next/*' -not -path './dist/*' -not -path './build/*' -print0 \
  | xargs -0 -n1 perl -CS -Mopen=:std,:encoding(UTF-8) -i -pe "$PERL_EXPR"

echo "Scan for remaining non-ASCII characters..."
if LC_ALL=C grep -R --line-number -P "[^\x00-\x7F]" . \
  --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=publish --exclude-dir=.next --exclude-dir=dist --exclude-dir=build; then
  echo "Non-ASCII characters still present above. Review and update the map if needed." >&2
  exit 1
else
  echo "No non-ASCII found"
fi

echo "Cleanup complete."