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
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models


class MachineInfo(models.Model):
    """Class that represents logs of storage/memory of a machine."""

    date_time = models.DateTimeField(
        auto_now_add=True
    )
    source = models.CharField(
        max_length=255,
        help_text='Source of machine information, e.g: django.'
    )
    storage_log = models.TextField(
        null=True,
        blank=True
    )
    memory_log = models.TextField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f'{self.date_time}'


class LogFile(models.Model):
    """Class that represent log file."""

    path = models.CharField(max_length=500, unique=True)
    size = models.PositiveBigIntegerField()
    created_on = models.DateTimeField()

    def filename(self):
        """Get the filename from the path."""
        return self.path.split('/')[-1]

    def __str__(self):
        return self.filename()
