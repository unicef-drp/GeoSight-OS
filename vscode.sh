#!/usr/bin/env bash

# Define the VSCode profile name
# This 'sandboxes' your VSCode session so that we do not get
# side effects from other VSCode installations / projects
VSCODE_PROFILE="geosight"

echo "🗨️ Checking deployment .env exists ..."
if [ ! -f deployment/.env ]; then
    echo "❌ deployment/.env file not found."
    echo "   Please run ./setup.sh to create it."
    echo "   See the documentation https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/setup/XXXX"
    exit 1
else
    echo "  ✅ deployment/.env found ok." 
fi

echo "🗨️ Checking VSCode is installed ..."
if ! command -v code &> /dev/null; then
    echo "  ❌ 'code' CLI for VSCode not found. Please install VSCode and add 'code' to your PATH."
    echo "  See the documentation https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/setup/run-with-vscode/#prerequisites"
    exit 1
else
    echo "  ✅ VSCode found ok." 
fi

echo "🗨️ Checking docker is installed ..."
if ! command -v docker &> /dev/null; then
    echo "  ❌ 'docker' CLI not found. Please install docker and ensure you have permissions to use it."
    echo "  See the documentation https://unicef-drp.github.io/GeoSight-OS-Documentation/developer/setup/FIXME!!!!!!"
    exit 1
else
    echo "  ✅ Docker found ok." 
fi

echo "🗨️  Performing pre-check redis directory with correct permissions..."
if [ ! -d deployment/volumes/tmp_data/redis ]; then
    echo "  📂 Creating deployment/volumes/tmp_data/redis and setting permissions..."
    mkdir -p deployment/volumes/tmp_data/redis
    sudo chown -R 1001:1001 deployment/volumes/tmp_data/redis
else
    echo "  ✅ Directory already exists: deployment/volumes/tmp_data/redis"
fi

echo "🪛 Installing VSCode Extensions:"
echo "--------------------------------"

# Ensure .vscode directory exists
echo "🗨️  Checking if VSCode has been run before..."
if [ ! -d .vscode ]; then
    echo "  🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻"
    echo "  ⭐️ It appears you have not run vscode in this project before."
    echo "     After it opens, please close vscode and then rerun this script"
    echo "     so that the extensions directory initialises properly."
    echo "  🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺"
    mkdir -p .vscode
    mkdir -p .vscode-extensions
    # Launch VSCode with the sandboxed environment
    code --user-data-dir='.vscode' \
        --profile="${VSCODE_PROFILE}" \
        --extensions-dir='.vscode-extensions' .
    exit 1
else
    echo "  ✅ VSCode directory found from previous runs of vscode."
fi


# Define the settings.json file path
SETTINGS_FILE=".vscode/settings.json"

# Ensure settings.json exists
echo "🗨️  Checking if VSCode settings file exists..."
if [[ ! -f "$SETTINGS_FILE" ]]; then
    echo "{}" > "$SETTINGS_FILE"
    echo "  🔧 VSCode settings created"

else
    echo "  ✅ VSCode settings found"
fi

# Update settings.json non-destructively
echo "🗨️ Updating VSCode settings.json to require git code signing ..."
jq '.["git.enableCommitSigning"] = true' \
   "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp" && mv "$SETTINGS_FILE.tmp" "$SETTINGS_FILE"
echo "  🔧 Code signing requirement added."

# Ensure markdown formatter is set if not already present
echo "🗨️ Updating VSCode settings.json to enable markdown formatter"
if ! jq -e '."[markdown]".editor.defaultFormatter' "$SETTINGS_FILE" >/dev/null; then
    echo "  Setting [markdown].editor.defaultFormatter..."
    jq '."[markdown]" += {"editor.defaultFormatter": "DavidAnson.vscode-markdownlint"}' \
       "$SETTINGS_FILE" > "$SETTINGS_FILE.tmp" && mv "$SETTINGS_FILE.tmp" "$SETTINGS_FILE"
    echo "  🔧 Markdown formatter settings created"
else
    echo "  ✅ [markdown].editor.defaultFormatter already set, skipping..."
fi

echo "  ✅ VSCode settings.json updated successfully!"
echo "Contents of settings.json:"
cat "$SETTINGS_FILE"


#EXTENSION_ID="ms-vscode-remote.remote-containers"



# Install required extensions
# List of required extensions with versions
REQUIRED_EXTENSIONS=(
    "aikebang.mkdocs-syntax-highlight@0.2.1"
    "bierner.markdown-mermaid@1.28.0"
    "bpruitt-goddard.mermaid-markdown-syntax-highlighting@1.7.1"
    "DavidAnson.vscode-markdownlint@0.60.0"
    "GitHub.copilot@1.250.0"
    "GitHub.copilot-chat@0.25.1"
    "joffreykern.markdown-toc@1.4.0"
    "JorgeBertocchini.mkdocs-alias-navigator@0.0.2"
    "MermaidChart.vscode-mermaid-chart@2.3.0"
    "mkhl.direnv@0.17.0"
    "naumovs.color-highlight@2.8.0"
    "rpinski.shebang-snippets@1.1.0"
    "shd101wyy.markdown-preview-enhanced@0.8.15"
    "timonwong.shellcheck@0.37.7"
    "waderyan.gitblame@11.1.2"
    "yzhang.markdown-all-in-one@3.6.3"
)

echo "🗨️ Checking and installing required VSCode extensions..."
for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    ext_id="${ext%@*}"
    ext_ver="${ext#*@}"
    # Check if extension with version is already installed
    if code --profile="${VSCODE_PROFILE}" --extensions-dir=".vsode-extensions" --list-extensions --show-versions | grep -q "^${ext_id}-${ext_ver}$"; then
        echo "  ✅ Extension ${ext} already installed."
    else
        echo "  📦 Installing extension ${ext}..."
        code --user-data-dir='.vscode' \
             --profile="${VSCODE_PROFILE}" \
             --extensions-dir='.vscode-extensions' \
             --install-extension "${ext}"
        # Verify installation
        if code --profile="${VSCODE_PROFILE}" --extensions-dir=".vsode-extensions" --list-extensions --show-versions | grep -q "^${ext_id}-${ext_ver}$"; then
            echo "  ✅ Successfully installed ${ext}."
        else
            echo "  ❌ Failed to install ${ext}."
            exit 1
        fi
    fi
done

# Launch VSCode with the sandboxed environment
code --user-data-dir='.vscode' \
--profile="${VSCODE_PROFILE}" \
--extensions-dir='.vscode-extensions' .
