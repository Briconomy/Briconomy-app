#!/bin/bash

set -e

RELEASE_TAG="windows_linux"
PREFERRED_ASSET_NAME="bricllm-v1.0-linux-x86_64.tar.gz"
INSTALL_DIR="bricllm"
BINARY_NAME="bricllm"
RELEASE_API_URL="https://api.github.com/repos/Briconomy/Bricllm/releases/tags/${RELEASE_TAG}"

echo "========================================"
echo "  Bricllm Update Script"
echo "========================================"
echo ""

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

download_asset() {
    local url="$1"
    local target="$2"
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$url" -o "$target"
    elif command -v wget >/dev/null 2>&1; then
        wget -qO "$target" "$url"
    else
        echo "Error: Neither curl nor wget is available"
        return 1
    fi
}

resolve_release_asset() {
    local preferred="$1"
    local json_path="$TEMP_DIR/release.json"

    echo "[fallback] Discovering release assets..."
    if command -v curl >/dev/null 2>&1; then
        if ! curl -fsSL "$RELEASE_API_URL" -o "$json_path"; then
            echo "Error: Unable to fetch release metadata"
            return 1
        fi
    elif command -v wget >/dev/null 2>&1; then
        if ! wget -qO "$json_path" "$RELEASE_API_URL"; then
            echo "Error: Unable to fetch release metadata"
            return 1
        fi
    else
        echo "Error: Neither curl nor wget is available for metadata fetch"
        return 1
    fi

    local output=""
    if command -v python3 >/dev/null 2>&1; then
        output=$(PREFERRED_ASSET="$preferred" python3 - "$json_path" <<'PY'
import json
import os
import sys

if len(sys.argv) < 2:
    sys.exit(1)

file_path = sys.argv[1]
preferred = os.environ.get("PREFERRED_ASSET", "")

with open(file_path, "r", encoding="utf-8") as handle:
    data = json.load(handle)

assets = data.get("assets") or []
candidate = None

if preferred:
    for asset in assets:
        if asset.get("name") == preferred and asset.get("browser_download_url"):
            candidate = asset
            break

if candidate is None:
    for asset in assets:
        if asset.get("browser_download_url"):
            candidate = asset
            break

if candidate is None:
    sys.exit(1)

print(candidate.get("name", ""))
print(candidate.get("browser_download_url", ""))
PY
        )
    elif command -v python >/dev/null 2>&1; then
        output=$(PREFERRED_ASSET="$preferred" python - "$json_path" <<'PY'
import json
import os
import sys

if len(sys.argv) < 2:
    sys.exit(1)

file_path = sys.argv[1]
preferred = os.environ.get("PREFERRED_ASSET", "")

with open(file_path, "r") as handle:
    data = json.load(handle)

assets = data.get("assets") or []
candidate = None

if preferred:
    for asset in assets:
        if asset.get("name") == preferred and asset.get("browser_download_url"):
            candidate = asset
            break

if candidate is None:
    for asset in assets:
        if asset.get("browser_download_url"):
            candidate = asset
            break

if candidate is None:
    sys.exit(1)

print(candidate.get("name", ""))
print(candidate.get("browser_download_url", ""))
PY
        )
    elif command -v deno >/dev/null 2>&1; then
        output=$(PREFERRED_ASSET="$preferred" deno eval --quiet --allow-read 'const filePath = Deno.args[0]; const preferred = Deno.env.get("PREFERRED_ASSET") ?? ""; const data = JSON.parse(await Deno.readTextFile(filePath)); const assets = Array.isArray(data.assets) ? data.assets : []; let candidate = assets.find((asset) => asset?.name === preferred && typeof asset?.browser_download_url === "string"); if (!candidate) { candidate = assets.find((asset) => typeof asset?.browser_download_url === "string"); } if (!candidate) { Deno.exit(1); } console.log(candidate.name ?? ""); console.log(candidate.browser_download_url ?? "");' "$json_path")
    else
        echo "Error: python3, python, or deno is required to parse release metadata"
        return 1
    fi

    local status=$?
    if [ $status -ne 0 ] || [ -z "$output" ]; then
        echo "Error: Unable to determine release asset"
        return 1
    fi

    IFS=$'\n' read -r resolved_name resolved_url <<EOF
$output
EOF

    if [ -z "$resolved_name" ] || [ -z "$resolved_url" ]; then
        echo "Error: Release metadata missing expected fields"
        return 1
    fi

    ASSET_NAME="$resolved_name"
    DOWNLOAD_URL="$resolved_url"
    TARGET_FILE="$TEMP_DIR/$ASSET_NAME"
    return 0
}

ASSET_NAME="$PREFERRED_ASSET_NAME"
DOWNLOAD_URL="https://github.com/Briconomy/Bricllm/releases/download/${RELEASE_TAG}/${ASSET_NAME}"
TARGET_FILE="$TEMP_DIR/$ASSET_NAME"

echo "[1/5] Downloading Bricllm release binary..."
if ! download_asset "$DOWNLOAD_URL" "$TARGET_FILE"; then
    if ! resolve_release_asset "$PREFERRED_ASSET_NAME"; then
        exit 1
    fi
    echo "[retry] Downloading resolved asset: $ASSET_NAME"
    if ! download_asset "$DOWNLOAD_URL" "$TARGET_FILE"; then
        echo "Error: Download failed after resolving release asset"
        exit 1
    fi
fi

if [ ! -s "$TARGET_FILE" ]; then
    echo "Error: Downloaded file is empty"
    exit 1
fi

echo ""
echo "[2/5] Preparing installation directory..."
mkdir -p "$INSTALL_DIR"

echo ""
echo "[3/5] Extracting and installing binary..."
if [[ "$ASSET_NAME" == *.tar.gz ]]; then
    tar -xzf "$TARGET_FILE" -C "$INSTALL_DIR"
    if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
        chmod +x "$INSTALL_DIR/$BINARY_NAME"
    else
        extracted_binary=$(find "$INSTALL_DIR" -name "bricllm" -type f 2>/dev/null | head -n 1)
        if [ -n "$extracted_binary" ] && [ -f "$extracted_binary" ]; then
            mv "$extracted_binary" "$INSTALL_DIR/$BINARY_NAME"
            chmod +x "$INSTALL_DIR/$BINARY_NAME"
        else
            echo "Error: Binary not found in archive"
            rm -rf "$TEMP_DIR"
            exit 1
        fi
    fi
elif [[ "$ASSET_NAME" == *.zip ]]; then
    if command -v unzip >/dev/null 2>&1; then
        unzip -q "$TARGET_FILE" -d "$INSTALL_DIR"
        if [ -f "$INSTALL_DIR/$BINARY_NAME" ]; then
            chmod +x "$INSTALL_DIR/$BINARY_NAME"
        else
            extracted_binary=$(find "$INSTALL_DIR" -name "bricllm" -type f 2>/dev/null | head -n 1)
            if [ -n "$extracted_binary" ] && [ -f "$extracted_binary" ]; then
                mv "$extracted_binary" "$INSTALL_DIR/$BINARY_NAME"
                chmod +x "$INSTALL_DIR/$BINARY_NAME"
            else
                echo "Error: Binary not found in archive"
                rm -rf "$TEMP_DIR"
                exit 1
            fi
        fi
    else
        echo "Error: unzip command not found"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
else
    mv "$TARGET_FILE" "$INSTALL_DIR/$BINARY_NAME"
    chmod +x "$INSTALL_DIR/$BINARY_NAME"
fi

echo ""
echo "[4/5] Cleaning up..."
rm -rf "$TEMP_DIR"

echo ""
echo "[5/5] Verifying installation..."
if [ -x "$INSTALL_DIR/$BINARY_NAME" ]; then
    VERSION=$("$INSTALL_DIR/$BINARY_NAME" --help 2>&1 | head -n 1 || echo "Bricllm")
    echo "Installation successful!"
    echo "Binary location: $(pwd)/$INSTALL_DIR/$BINARY_NAME"
    echo ""
else
    echo "Error: Binary verification failed"
    exit 1
fi

echo "========================================"
echo "  Update Complete!"
echo "========================================"
echo ""
echo "Bricllm is now integrated with the chatbot."
echo "Restart your API server to use the updated LLM."
echo ""
