#!/usr/bin/env bash

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

# Get the latest backup from production
SOURCE_FOLDER=/source
SOURCE_SERVER=server

DEST_FOLDER=/destination
DATABASE_NAME=django

echo "copy latest backup file"
scp $SOURCE_SERVER:$SOURCE_FOLDER/backups/$(ssh $SOURCE_SERVER "$SOURCE_FOLDER/backups; find $1 -type f -exec stat --format '%Y :%y %n' "{}" \; | sort -nr | cut -d. -f3- | head -1") $DEST_FOLDER/backups/latest.dmp

# Restart docker db
DOCKER_DB=geosight_db
echo "restore the backup"
cp revoke.sql $DEST_FOLDER/backups
cp restore.sql $DEST_FOLDER/backups
docker exec $DOCKER_DB su - postgres -c "psql django -f /backups/revoke.sql"
docker exec $DOCKER_DB su - postgres -c "dropdb $DATABASE_NAME"
docker exec $DOCKER_DB su - postgres -c "createdb $DATABASE_NAME"
docker exec $DOCKER_DB su - postgres -c "pg_restore -d django /backups/latest.dmp"
docker exec $DOCKER_DB su - postgres -c "psql django -f /backups/restore.sql"

echo "run migration"
DOCKER_UWSGI=geosight_django
docker exec $DOCKER_UWSGI python manage.py migrate

echo "copy media and tiles"
rsync -avz $SOURCE_SERVER:$SOURCE_FOLDER/media $DEST_FOLDER/media

echo "run collectstatic"
docker exec $DOCKER_UWSGI python manage.py collectstatic --noinput
docker exec $DOCKER_UWSGI uwsgi --reload /tmp/django.pid
