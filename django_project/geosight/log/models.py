# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '13/11/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models


class LogFile(models.Model):
    """Class that represent log file."""

    path = models.CharField(max_length=500, unique=True)
    size = models.PositiveBigIntegerField(
        null=True, blank=True, editable=False
    )
    created_on = models.DateTimeField(
        auto_now_add=True,
    )

    def filename(self):
        """Get the filename from the path.

        :return: filename
        :rtype: str
        """
        return self.path.split('/')[-1]

    def __str__(self):
        return self.filename()


class CleanupDirectoryLog(models.Model):
    """Class that represents logs of cleanup."""

    date_time = models.DateTimeField(
        auto_now_add=True
    )
    storage_path = models.TextField(
        help_text='The path of the storage that was cleaned up.'
    )
    usage_percentage = models.FloatField(
        null=True,
        blank=True
    )
    critical_threshold = models.FloatField(
        null=True,
        blank=True
    )
    deleted_files_count = models.PositiveIntegerField(
        null=True,
        blank=True
    )
    freed_space_bytes = models.PositiveBigIntegerField(
        null=True,
        blank=True
    )
    deleted_files = models.JSONField(
        null=True,
        blank=True,
        default=list
    )

    class Meta:  # noqa: D106
        ordering = ["-date_time"]
