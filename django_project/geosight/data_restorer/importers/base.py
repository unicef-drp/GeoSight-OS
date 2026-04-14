# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-No-reply@unicef.org

.. Note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '14/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

import json
from abc import ABC, abstractmethod

from django.contrib.auth import get_user_model

User = get_user_model()


class BaseImporter(ABC):
    """Abstract base class for demo-data importers."""

    def __init__(self, filepath):
        """Initialize with path to the JSON file."""
        self.filepath = filepath

    def _load(self):
        """Load and group JSON records by model label."""
        with open(self.filepath, 'r') as f:
            data = json.load(f)
        by_model = {}
        for record in data:
            by_model.setdefault(record['model'], []).append(record)
        return by_model

    @staticmethod
    def _get_user(pk):
        """Return the User matching pk, or None."""
        return User.objects.get(pk=pk)

    @abstractmethod
    def run(self):
        """Import all records and return the primary created object."""
        raise NotImplementedError
