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
__date__ = '22/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from types import MethodType

from celery import current_app
from django.conf import settings
from django.db import connections
from django.test.runner import DiscoverRunner


def prepare_database(self):
    """Prepare database for test."""
    with self.cursor() as cursor:
        cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis')
        cursor.execute(
            f'CREATE SCHEMA IF NOT EXISTS {settings.TEMP_SCHEMA_NAME}'
        )


class PostgresSchemaTestRunner(DiscoverRunner):
    """Postgres schema test runner."""

    def setup_databases(self, **kwargs):
        """Set up database for runner."""
        for connection_name in connections:
            connection = connections[connection_name]
            connection.prepare_database = MethodType(
                prepare_database, connection
            )
        return super().setup_databases(**kwargs)

    @staticmethod
    def __disable_celery():
        """Disabling celery."""
        settings.CELERY_BROKER_URL = \
            current_app.conf.CELERY_BROKER_URL = 'filesystem:///dev/null/'
        data = {
            'data_folder_in': '/tmp',
            'data_folder_out': '/tmp',
            'data_folder_processed': '/tmp',
        }
        settings.BROKER_TRANSPORT_OPTIONS = \
            current_app.conf.BROKER_TRANSPORT_OPTIONS = data

    def setup_test_environment(self, **kwargs):
        """Prepare test env."""
        PostgresSchemaTestRunner.__disable_celery()
        super(PostgresSchemaTestRunner, self).setup_test_environment(**kwargs)
