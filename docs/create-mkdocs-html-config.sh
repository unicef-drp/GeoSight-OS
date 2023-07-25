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
# html site generation.

# This script is used both in manual
# site compilation (via build-docs-html.sh)
# and via the github workflow for 
# publishing the site to github pages
# .github/workflows/BuildMKDocsAndPublishToGithubPages.yml

cat mkdocs-base.yml > mkdocs.yml
cat mkdocs-html.yml >> mkdocs.yml