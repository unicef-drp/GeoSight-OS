#!/bin/bash

# --------------------------------------------------
# copy .env
# --------------------------------------------------
if [ ! -f deployment/.env ]; then
  echo "-----------------------------"
  echo "Copying .template.env to .env"
  echo ""
  echo "You are using the default environment settings."
  echo "You can review the environment details here:"
  echo "https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/setup/code-preparation/#set-up-different-environment-optional"
  echo ""
  echo "By default, the plugins 'cloud_native_gis' and 'reference_dataset' are enabled."
  echo "For more information about plugins, visit:"
  echo "https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/manual/plugins/#geosight-plugin"
  echo ""
  read -p "Press Enter to copying..."
  cp deployment/.template.env deployment/.env
else
  echo ".env already exists, skipping"
fi

# --------------------------------------------------
# copy docker-compose.override.template.yml
# --------------------------------------------------
if [ ! -f deployment/docker-compose.override.yml ]; then
  echo "Copying docker-compose.override.template.yml to docker-compose.override.yml"
  cp deployment/docker-compose.override.template.yml deployment/docker-compose.override.yml
else
  echo "docker-compose.override.yml already exists, skipping"
fi

# --------------------------------------------------
# CHECK THE ARCHITECTURE AND PULL CORRECT UBUNTU
# --------------------------------------------------
ARCH=$(uname -m)
PLATFORM="linux/amd64"
[[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]] && PLATFORM="linux/arm64"

# Pull ubuntu
echo "Pull ubuntu for ($PLATFORM)"
docker pull --platform=$PLATFORM ubuntu:22.04