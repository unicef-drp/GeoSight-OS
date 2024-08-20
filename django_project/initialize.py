# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import os
import shutil
import time

import django

from core.utils import create_superuser

django.setup()

#########################################################
# Imports
#########################################################
from django.db import connection
from django.db.utils import OperationalError
from django.core.management import call_command

# Getting the secrets
admin_username = os.getenv('ADMIN_USERNAME')
admin_password = os.getenv('ADMIN_PASSWORD')
admin_email = os.getenv('ADMIN_EMAIL')

#########################################################
# 1. Waiting for PostgreSQL
#########################################################

print("-----------------------------------------------------")
print("1. Waiting for PostgreSQL")
for _ in range(60):
    try:
        connection.ensure_connection()
        break
    except OperationalError:
        time.sleep(1)
else:
    connection.ensure_connection()
connection.close()

#########################################################
# 2. Running the migrations
#########################################################

print("-----------------------------------------------------")
print("2. Running the migrations")
call_command('makemigrations')
call_command('migrate', '--noinput')

#########################################################
# 3. Collecting static files
#########################################################

print("-----------------------------------------------------")
print("4. Collecting static files")
folder = '/home/web/static'
try:
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception:
            pass
except Exception:
    pass

call_command('collectstatic', '--noinput', verbosity=0)

#########################################################
# 4. Remove all cache
#########################################################

print("-----------------------------------------------------")
print("5. Remove all cache version is different")
from core.context_processors.global_context import project_version
from django.core.cache import cache

if cache.get('APP_KEY') != project_version(None):
    try:
        for key in cache.keys('*/api*'):
            cache.delete(key)
        cache.set('APP_KEY', project_version(None))
        print("Version is different, remove all")
    except Exception:
        pass

#########################################################
# 5. Restart backgrounds functions
#########################################################

try:
    from geosight.importer.restart_functions import RestartFunctions

    print("-----------------------------------------------------")
    print("6. Restart backgrounds functions")

    RestartFunctions().restart_log_sata_save_progress()
except Exception as e:
    print(f'{e}')
    pass

#########################################################
# 6. Creating superuser if it doesn't exist
#########################################################
print("-----------------------------------------------------")
print("3. Creating/updating superuser")
create_superuser()

#########################################################
# 7. Create default domain for tenant
#########################################################
try:
    from tenants.models import Client, Domain

    for client in Client.objects.all():
        client.create_superuser()

    print("-----------------------------------------------------")
    print("7. Create default domain for tenant")
    app_domain = os.getenv('APP_DOMAIN', 'localhost')
    client, _ = Client.objects.get_or_create(
        schema_name='public', name='Main'
    )
    Domain.objects.get_or_create(
        domain=app_domain,
        tenant=client, defaults={
            'is_primary': True
        }
    )
except Exception as e:
    print(f'{e}')
    pass
