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

from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractEditData


class ReferenceLayerViewUploader(AbstractEditData):
    """Reference Layer view uploader."""

    name = models.CharField(
        max_length=256,
        help_text=_("Reference layer name.")
    )

    description = models.TextField(
        null=True, blank=True
    )


class ReferenceLayerViewUploaderLevel(models.Model):
    """Reference Layer view uploader per level."""

    uploader = models.ForeignKey(
        ReferenceLayerViewUploader, on_delete=models.CASCADE
    )
    file = models.FileField(
        upload_to='georepo/importers',
    )
    level = models.IntegerField()
    name = models.CharField(
        max_length=256,
        help_text=_("Level name.")
    )

    # Column names
    name_column = models.CharField(
        max_length=256,
        help_text=_("Column indicate the name.")
    )
    ucode_column = models.CharField(
        max_length=256,
        help_text=_("Column indicate the ucode.")
    )
    parent_ucode_column = models.CharField(
        max_length=256,
        null=True, blank=True,
        help_text=_(
            "Column indicate the parent ucode. "
            "This is just 1 level above it."
        )
    )
