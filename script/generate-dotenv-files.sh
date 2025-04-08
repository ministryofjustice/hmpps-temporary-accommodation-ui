#!/usr/bin/env bash

set -e
# shellcheck disable=SC3040
set -o pipefail

cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"
# shellcheck source=script/utils/resolve_secrets.sh
. "$SCRIPT_DIR"/utils/resolve_secrets.sh

echo "==> Creating .env files and resolving secrets"

touch "$SCRIPT_DIR/../.env"

secret_names=("hmpps-cas-test-users" "hmpps-temporary-accommodation-ui")
resolve_secrets "$SCRIPT_DIR/../e2e_playwright.env.template" \
                "$SCRIPT_DIR/../e2e_playwright.env" \
                "hmpps-community-accommodation-dev" \
                "${secret_names[@]}"

resolve_secrets "$SCRIPT_DIR/../e2e.env.template" \
                "$SCRIPT_DIR/../e2e.env" \
                "hmpps-community-accommodation-dev" \
                "${secret_names[@]}"