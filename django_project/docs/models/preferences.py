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

from django.db import models

from .singleton import SingletonModel


class DocumentationPreferences(SingletonModel):
    """Preference settings specifically for Documentation."""

    documentation_base_url = models.CharField(
        max_length=512,
        default='https://unicef-drp.github.io/GeoSight-OS/'
    )

    class Meta:  # noqa: D106
        verbose_name_plural = "documentation preferences"

    @staticmethod
    def preferences() -> "DocumentationPreferences":
        """Load Site Preference."""
        return DocumentationPreferences.load()

    def __str__(self):
        return 'Documentation Preference'
