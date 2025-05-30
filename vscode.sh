#!/bin/bash

# --- Pre-check and create redis directory with permissions ---

if [ ! -d deployment/volumes/tmp_data/redis ]; then
    echo "Creating deployment/volumes/tmp_data/redis and setting permissions..."
    mkdir -p deployment/volumes/tmp_data/redis
    sudo chown -R 1001:1001 deployment/volumes/tmp_data/redis
else
    echo "Directory already exists: deployment/volumes/tmp_data/redis"
fi

EXTENSION_ID="ms-vscode-remote.remote-containers"

# Check if VS Code CLI is available
if ! command -v code &> /dev/null; then
    echo "❌ 'code' CLI not found. Please install VS Code and add 'code' to your PATH. See the documentation https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/setup/run-with-vscode/#prerequisites"
    exit 1
fi

# Check if the extension is already installed in the custom dir
if code --list-extensions | grep -q "$EXTENSION_ID"; then
    echo "✅ '$EXTENSION_ID' is already installed in '$EXT_DIR'."
else
    echo "📦 Installing '$EXTENSION_ID' into '$EXT_DIR'..."
    code --install-extension "$EXTENSION_ID"

    if code --list-extensions | grep -q "$EXTENSION_ID"; then
        echo "✅ Successfully installed '$EXTENSION_ID' into '$EXT_DIR'."
    else
        echo "❌ Failed to install '$EXTENSION_ID' into '$EXT_DIR'."
        exit 1
    fi
fi

echo "🚀 Opening VS Code in current folder"
code .
