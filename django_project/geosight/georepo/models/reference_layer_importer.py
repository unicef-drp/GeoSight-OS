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
from geosight.georepo.models.reference_layer import ReferenceLayerView


class LogStatus(object):
    """Quick access for coupling variable with Log status string."""

    WAITING_FILES = 'Waiting files'
    START = 'Start'
    RUNNING = 'Running'
    FAILED = 'Failed'
    SUCCESS = 'Success'


class ReferenceLayerViewImporter(AbstractEditData):
    """Reference Layer view importer."""

    reference_layer = models.ForeignKey(
        ReferenceLayerView, on_delete=models.CASCADE
    )

    # Import status
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    progress = models.IntegerField(default=0)
    status = models.CharField(
        max_length=100,
        choices=(
            (LogStatus.WAITING_FILES, _(LogStatus.WAITING_FILES)),
            (LogStatus.START, _(LogStatus.START)),
            (LogStatus.RUNNING, _(LogStatus.RUNNING)),
            (LogStatus.FAILED, _(LogStatus.FAILED)),
            (LogStatus.SUCCESS, _(LogStatus.SUCCESS)),
        ),
        default=LogStatus.WAITING_FILES
    )
    note = models.TextField(blank=True, null=True)

    def run(self):
        """Run the importer."""
        pass


class ReferenceLayerViewImporterLevel(models.Model):
    """Reference Layer view importer per level."""

    importer = models.ForeignKey(
        ReferenceLayerViewImporter, on_delete=models.CASCADE
    )
    level = models.IntegerField(
        null=True, blank=True
    )
    file_id = models.CharField(
        max_length=256,
        null=True, blank=True
    )
    file = models.FileField(
        upload_to='georepo/importers',
    )
    properties = models.JSONField(
        null=True, blank=True
    )

    # Field names
    name_field = models.CharField(
        max_length=256,
        help_text=_("Field indicate the name.")
    )
    ucode_field = models.CharField(
        max_length=256,
        help_text=_("Field indicate the ucode.")
    )
    parent_ucode_field = models.CharField(
        max_length=256,
        null=True, blank=True,
        help_text=_(
            "Field indicate the parent ucode. "
            "This is just 1 level above it."
        )
    )

    class Meta:  # noqa: D106
        ordering = ('level',)

    def get_properties(self):
        """Return properties."""
        from geosight.utils.fiona import (
            open_collection_by_file, check_layer_type
        )
        if not self.properties:
            features = open_collection_by_file(
                self.file, check_layer_type(self.file.name)
            )
            try:
                self.properties = list(features[0].properties.keys())
                self.save()
            except AttributeError:
                pass
        return self.properties if self.properties else []
