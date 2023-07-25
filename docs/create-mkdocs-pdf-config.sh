#!/bin/bash

# GeoSight is UNICEF's geospatial web-based business intelligence platform.
#
# Contact : geosight-no-reply@unicef.org
#
# .. note:: This program is free software; you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation; either version 3 of the License, or
#     (at your option) any later version.
#
# __author__ = 'irwan@kartoza.com'
# __date__ = '13/06/2023'
# __copyright__ = ('Copyright 2023, Unicef')

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