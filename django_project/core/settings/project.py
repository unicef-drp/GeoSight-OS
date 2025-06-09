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

import os  # noqa

from celery.schedules import crontab
from django.utils.translation import ugettext_lazy as _

from .apps import *  # noqa
from .contrib import *  # noqa

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'
ALLOWED_HOSTS = ['*']
ADMINS = (
    ('Irwan Fathurrahman', 'irwam@kartoza.com'),
)

TEMP_SCHEMA_NAME = 'temp_upload'

# Database engine based on tenant
DATABASE_ENGINE = 'django.contrib.gis.db.backends.postgis'
if TENANTS_ENABLED:
    DATABASE_ENGINE = 'django_tenants.postgresql_backend',

DATABASES = {
    'default': {
        'ENGINE': DATABASE_ENGINE,
        'NAME': os.environ['DATABASE_NAME'],
        'USER': os.environ['DATABASE_USERNAME'],
        'PASSWORD': os.environ['DATABASE_PASSWORD'],
        'HOST': os.environ['DATABASE_HOST'],
        'PORT': 5432,
        'TEST_NAME': 'unittests',
    },
    'temp': {
        'ENGINE': DATABASE_ENGINE,
        'OPTIONS': {
            'options': (
                '-c search_path='
                f'pg_toast,pg_catalog,'
                f'information_schema,topology,{TEMP_SCHEMA_NAME}'
            )
        },
        'NAME': os.environ['DATABASE_NAME'],
        'USER': os.environ['DATABASE_USERNAME'],
        'PASSWORD': os.environ['DATABASE_PASSWORD'],
        'HOST': os.environ['DATABASE_HOST'],
        'PORT': 5432,
        'TEST_NAME': 'unittests',
    }
}

# If tenant enabled
if TENANTS_ENABLED:
    ORIGINAL_BACKEND = "django.contrib.gis.db.backends.postgis"
    DATABASE_ROUTERS = (
        'django_tenants.routers.TenantSyncRouter',
        'core.router.Router'
    )
else:
    DATABASE_ROUTERS = ['core.router.Router']

# Due to profile page does not available,
# this will redirect to home page after login
LOGIN_REDIRECT_URL = '/'

# How many versions to list in each project box
PROJECT_VERSION_LIST_SIZE = 10

# Set debug to false for production
DEBUG = TEMPLATE_DEBUG = IS_TEST = False

SOUTH_TESTS_MIGRATE = False

# Set languages which want to be translated
LANGUAGES = (
    ('en-us', _('English')),
    ('es-es', _('Spanish')),
)

# Set storage path for the translation files
LOCALE_PATHS = (ABS_PATH('frontend', 'locales', 'django'),)

DATA_UPLOAD_MAX_NUMBER_FIELDS = 10000

# -------------------------------------------------- #
# ----------           ONEDRIVE         ------------ #
# -------------------------------------------------- #
ONEDRIVE_ROOT = '/onedrive/data'

# -------------------------------------------------- #
# ----------           BACKUPS          ------------ #
# -------------------------------------------------- #
BACKUPS_ROOT = '/backups'

# use custom filter to hide other sensitive informations
DEFAULT_EXCEPTION_REPORTER_FILTER = (
    'core.settings.filter.ExtendSafeExceptionReporterFilter'
)

# -------------------------------------------------- #
# ----------        AZURE CONFIG        ------------ #
# -------------------------------------------------- #
# empty config will be not using azure
AZURE_AUTH = {}
GEOREPO_AZURE_AUTH = {}

USE_AZURE = os.environ.get('AZURE_B2C_CLIENT_ID', False) not in [
    False, '', "''"]
if USE_AZURE:
    LOGIN_URL = 'login'
    # redirect when user is not within Unicef group and
    # does not have GeoRepo account
    USER_NO_ACCESS_URL = ''
    LOGOUT_REDIRECT_URL = '/'
    AZURE_AUTH = {
        'CLIENT_ID': os.environ.get('AZURE_B2C_CLIENT_ID'),
        'CLIENT_SECRET': os.environ.get('AZURE_B2C_CLIENT_SECRET'),
        'TENANT_NAME': os.environ.get('AZURE_B2C_TENANT_NAME'),
        'POLICY_NAME': os.environ.get('AZURE_B2C_POLICY_NAME'),
        'RENAME_ATTRIBUTES': [
            ('given_name', 'first_name'),
            ('family_name', 'last_name'),
            ('email', 'email')
        ],
        'SAVE_ID_TOKEN_CLAIMS': False,
        # request access token
        'SCOPES': [os.environ.get('AZURE_B2C_CLIENT_ID')],
        'PUBLIC_URLS': [],
    }
    AUTHENTICATION_BACKENDS = [
                                  'azure_auth.backends.AzureAuthBackend'
                              ] + AUTHENTICATION_BACKENDS

    AZURE_REGISTERED_CLIENT_IDS = [AZURE_AUTH['CLIENT_ID']]

CELERY_BEAT_SCHEDULE = {
    'fetch_datasets_nightly': {
        'task': 'geosight.georepo.tasks.fetch_datasets',
        'schedule': crontab(minute='0', hour='0'),
        'args': (True,),
    }
}

# Beat schedule for plugins
if CLOUD_NATIVE_GIS_ENABLED:
    CELERY_BEAT_SCHEDULE.update({
        'clean_cloud_native': {
            'task': 'geosight.cloud_native_gis.tasks.clean_cloud_native_layer',
            'schedule': crontab(minute='0', hour='0'),
        }
    })
if MACHINE_INFO_FETCHER_ENABLED:
    CELERY_BEAT_SCHEDULE.update({
        'machine_info_fetcher_api': {
            'task': (
                'geosight.machine_info_fetcher.tasks.'
                'trigger_storage_checker_api'
            ),
            'schedule': crontab(minute='*/15'),
        },
        'machine_info_fetcher_clean_log': {
            'task': (
                'geosight.machine_info_fetcher.tasks.clean_old_machine_info'
            ),
            'schedule': crontab(minute='0', hour='0'),
        },
    })

# ----------------------------------------
# Setup for tenants
# ----------------------------------------
if TENANTS_ENABLED:
    MIDDLEWARE = (
                     'geosight.tenants.middleware.main.TenantMainMiddleware',
                 ) + MIDDLEWARE

    # Remove this because we use tenants admin
    INSTALLED_APPS = [
        app for app in INSTALLED_APPS if app != 'django.contrib.admin'
    ]

# ----------------------------------------
# Logs Directory
# ----------------------------------------
LOGS_DIRECTORY = os.environ.get(
    'LOGS_DIRECTORY', '/home/web/logs'
)
