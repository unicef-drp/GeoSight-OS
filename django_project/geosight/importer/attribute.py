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

from typing import List

from dateutil import parser
from django.contrib.auth import get_user_model

User = get_user_model()


class ImporterAttributeInputType(object):
    """A quick couple of variable and importer type."""

    TEXT = 'text'
    NUMBER = 'number'
    DATE = 'date'
    FILE = 'file'
    BOOLEAN = 'bool'


class ImporterAttribute(object):
    """Attribute class for data."""

    options = []

    def __init__(
            self, name: str,
            required: bool = True,
            input_type: str = ImporterAttributeInputType.TEXT,
            options: List = None,
            default_value=None
    ):
        """Init."""
        self.name = name
        self.required = required
        self.input_type = input_type
        self.options = options
        self.default_value = default_value

    def validate(self, value):
        """Check value if allowed or not.

        Return new value.
        """
        from geosight.importer.exception import ImporterError
        if value is None and self.default_value:
            value = self.default_value

        if self.required:
            if value is None:
                raise ImporterError(f'{self.name} is required and it is empty')

        # Check value if date
        if value:
            # Check value in options
            if self.options:
                if value not in self.options:
                    raise ImporterError(
                        f'{value} not in options : {self.options}'
                    )

            if self.input_type == ImporterAttributeInputType.DATE:
                try:
                    return parser.parse(value)
                except Exception as e:
                    raise ImporterError(f'{self.name} {e}')
        return value
