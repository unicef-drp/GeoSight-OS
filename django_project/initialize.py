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
import time

import django

django.setup()

#########################################################
# Imports
#########################################################
from django.db import connection
from django.db.utils import OperationalError
from django.contrib.auth import get_user_model
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
# 3. Creating superuser if it doesn't exist
#########################################################

print("-----------------------------------------------------")
print("3. Creating/updating superuser")
if os.getenv('AZURE_B2C_CLIENT_ID', '') != '':
    admin_email = os.getenv('B2C_ADMIN_EMAIL', admin_email)
    admin_username = os.getenv('B2C_ADMIN_EMAIL', admin_username)
try:
    superuser = get_user_model().objects.get(username=admin_username)
    superuser.is_active = True
    superuser.email = admin_email
    superuser.save()
    print('superuser successfully updated')
except get_user_model().DoesNotExist:
    superuser = get_user_model().objects.create_superuser(
        admin_username,
        admin_email,
    )
    print('superuser successfully created')
if os.getenv('AZURE_B2C_CLIENT_ID', '') == '':
    # when b2c is disabled, use ADMIN_PASSWORD
    superuser.set_password(admin_password)
    superuser.save()

#########################################################
# 4. Collecting static files
#########################################################

print("-----------------------------------------------------")
print("4. Collecting static files")
call_command('collectstatic', '--noinput', verbosity=0)

#########################################################
# 5. Loading fixtures
#########################################################

print("-----------------------------------------------------")
print("5. Loading fixtures")

# Disable fixtures loading in prod by including environment variable:
#  INITIAL_FIXTURES=False
import ast

# To conform with original behaviour of GeoNode, we need to set it to True
# as default value
_load_initial_fixtures = ast.literal_eval(
    os.getenv('INITIAL_FIXTURES', 'True')
)
if _load_initial_fixtures:
    call_command('loaddata', 'core/fixtures/color_palette.json')
