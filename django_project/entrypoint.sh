#!/bin/sh

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

# Exit script in case of error
set -e

echo $"\n\n\n"
echo "-----------------------------------------------------"
echo "STARTING DJANGO ENTRYPOINT $(date)"
echo "-----------------------------------------------------"

# Run NPM
cd /home/web/django_project/frontend
echo "npm install"
npm install
echo "npm build"
npm run build

# Run initialization
cd /home/web/django_project
echo 'Running initialize.py...'
python -u initialize.py

echo "-----------------------------------------------------"
echo "FINISHED DJANGO ENTRYPOINT --------------------------"
echo "-----------------------------------------------------"

# Run the CMD
exec "$@"

