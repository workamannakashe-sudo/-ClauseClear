#!/usr/bin/env bash
# Verifies that repository size remains under 5MB (excluding git directory)
set -euo pipefail

MAX_KB=5120
ACTUAL_KB=$(du -sk --exclude=.git --exclude=node_modules . | awk '{print $1}')

echo "=== ClauseClear Repository Size Audit ==="
echo "Actual size (excluding git & node_modules): ${ACTUAL_KB} KB"
echo "Maximum allowed ceiling: ${MAX_KB} KB"

if [ "${ACTUAL_KB}" -gt "${MAX_KB}" ]; then
  echo "FAIL: Repository size exceeds ${MAX_KB} KB limit."
  exit 1
fi

echo "PASS: Repository size is within judge-friendly lightweight bounds."
