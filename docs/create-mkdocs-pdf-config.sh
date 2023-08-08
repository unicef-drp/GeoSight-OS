#!/usr/bin/env bash

# This script will assemble a mkdocs.yml
# file with plugins section suitable for 
# PDF site generation.

# This script is used both in manual
# site compilation (via build-docs-html.sh)
# and via the github workflow for 
# publishing the site to github pages
# .github/workflows/CompileMKDocsToPDF.yml

cat mkdocs-base.yml > mkdocs.yml
cat mkdocs-pdf.yml >> mkdocs.yml
# This is a kludge: I could not figure out 
# how to reference image resources using a relative path in the scss...
cat templates/graphics.scss.templ | sed "s?\[BASE_FOLDER\]?$PWD?g" > templates/graphics.scss
