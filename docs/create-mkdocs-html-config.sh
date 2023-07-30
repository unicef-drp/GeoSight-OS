#!/usr/bin/env bash

# This script will assemble a mkdocs.yml
# file with plugins section suitable for 
# html site generation.

# This script is used both in manual
# site compilation (via build-docs-html.sh)
# and via the github workflow for 
# publishing the site to github pages
# .github/workflows/BuildMKDocsAndPublishToGithubPages.yml

cat mkdocs-base.yml > mkdocs.yml
cat mkdocs-html.yml >> mkdocs.yml
