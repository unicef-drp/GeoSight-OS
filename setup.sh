#!/usr/bin/env bash

# --------------------------------------------------
# GeoSight-OS Setup Script
# --------------------------------------------------

echo ""
echo "======================================"
echo "        🌍 GeoSight-OS Setup          "
echo "======================================"
echo ""

# --------------------------------------------------
# Copy .env
# --------------------------------------------------
if [ ! -f deployment/.env ]; then
  echo "🔧 Setting up environment configuration..."
  echo "------------------------------------------"
  echo "Copying deployment/.template.env → deployment/.env"
  echo ""
  echo "You are using the default environment settings."
  echo ""
  echo "You can review or customize them here:"
  echo "https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/setup/setup-generic/configuration/"
  echo ""
  echo "By default, these plugins will be enabled:"
  echo ""
  echo " * cloud_native_gis"
  echo " * reference_dataset"
  echo ""
  echo "Learn more about plugins here:"
  echo ""
  echo "https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/manual/plugins/"
  echo ""
  read -p "Press Enter to continue copying..."
  cp deployment/.template.env deployment/.env
  echo "✅ deployment/.env file created successfully."
else
  echo "✅ deployment/.env file already exists. Skipping."
fi

echo ""

# --------------------------------------------------
# Copy docker-compose.override.yml
# --------------------------------------------------
if [ ! -f deployment/docker-compose.override.yml ]; then
  echo "🔧 Setting up Docker Compose override..."
  echo "------------------------------------------"
  echo "Copying deployment/docker-compose.override.template.yml → deployment/docker-compose.override.yml"
  cp deployment/docker-compose.override.template.yml deployment/docker-compose.override.yml
  echo "✅ deployment/docker-compose.override.yml file created successfully."
else
  echo "✅ deployment/docker-compose.override.yml already exists. Skipping."
fi

echo ""

# --------------------------------------------------
# Check the architecture and pull correct Ubuntu image
# --------------------------------------------------
ARCH=$(uname -m)
PLATFORM="linux/amd64"
[[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]] && PLATFORM="linux/arm64"

echo "🐳 Pulling Ubuntu image for architecture: $PLATFORM"
echo "------------------------------------------"
docker pull --platform=$PLATFORM ubuntu:22.04
echo "✅ Ubuntu image pulled successfully."

echo ""
echo "🚀 GeoSight-OS setup complete!"
echo ""
echo "Now you can launch vscode by running:"
echo ""
echo "./vscode.sh"
echo ""
echo "Please visit the GeoSight-OS Documentation pages for more developer workflow help."
echo "https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/"
