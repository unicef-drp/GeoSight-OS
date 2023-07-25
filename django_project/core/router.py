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

"""Router for multiple database."""

DEFAULT_DATABASE = 'default'


class Router(object):
    """A router to control all database operations on models."""

    def db_for_read(self, model, **hints):
        """Attempt to read."""
        return DEFAULT_DATABASE

    def db_for_write(self, model, **hints):
        """Attempt to write models."""
        return DEFAULT_DATABASE

    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations of models for same db."""
        if obj1._state.db == obj2._state.db:
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """Just allow migrations to default database."""
        return db == DEFAULT_DATABASE
