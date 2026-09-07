#!/usr/bin/env bash
set -euo pipefail

exec docker compose run --rm --entrypoint mvn backend test "$@"
