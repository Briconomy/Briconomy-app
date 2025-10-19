#!/bin/bash

set -e

REPO_URL="https://github.com/Briconomy/Bricllm.git"
BUILD_DIR="bricllm-build"
INSTALL_DIR="bricllm"
BINARY_NAME="bricllm"

echo "========================================"
echo "  Bricllm Update Script"
echo "========================================"
echo ""

if [ ! -d "$BUILD_DIR" ]; then
    echo "[1/5] Cloning Bricllm repository..."
    git clone "$REPO_URL" "$BUILD_DIR"
else
    echo "[1/5] Updating Bricllm repository..."
    cd "$BUILD_DIR"
    git fetch origin
    git reset --hard origin/main
    cd ..
fi

echo ""
echo "[2/5] Building Bricllm..."
cd "$BUILD_DIR"

if [ ! -f "Makefile" ]; then
    echo "Error: Makefile not found in repository"
    exit 1
fi

make clean 2>/dev/null || true
make

if [ ! -f "$BINARY_NAME" ]; then
    echo "Error: Build failed - binary not found"
    exit 1
fi

cd ..

echo ""
echo "[3/5] Creating installation directory..."
mkdir -p "$INSTALL_DIR"

echo ""
echo "[4/5] Installing binary..."
cp "$BUILD_DIR/$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
chmod +x "$INSTALL_DIR/$BINARY_NAME"

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
