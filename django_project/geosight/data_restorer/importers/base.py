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

    def __init__(self, filepath):  # noqa: DOC101,DOC103
        """
        Initialize the importer with the path to a JSON fixture file.

        :param filepath: Absolute path to the JSON file to import.
        :type filepath: str
        """
        self.filepath = filepath

    def _load(self):
        """
        Load the JSON fixture file and group records by model label.

        :return: Mapping of model label (e.g. ``'geosight_data.indicator'``)
            to the list of serialised record dicts for that model.
        :rtype: dict[str, list[dict]]
        """
        with open(self.filepath, 'r') as f:
            data = json.load(f)
        by_model = {}
        for record in data:
            by_model.setdefault(record['model'], []).append(record)
        return by_model

    @staticmethod
    def _get_user(pk):
        """
        Return the User instance matching the given primary key.

        :param pk: Primary key of the user to retrieve.
        :type pk: int
        :return: The matching user instance.
        :rtype: django.contrib.auth.models.AbstractBaseUser
        """
        return User.objects.get(pk=pk)

    @abstractmethod
    def run(self):
        """
        Import all records from the fixture file and return the primary object.

        Subclasses must implement this method to read ``self.filepath``,
        create all necessary database records, and return the top-level
        object that was created (e.g. an ``Indicator`` or ``Dashboard``).

        :raises NotImplementedError: If the subclass does not override this
            method.
        """
        raise NotImplementedError
