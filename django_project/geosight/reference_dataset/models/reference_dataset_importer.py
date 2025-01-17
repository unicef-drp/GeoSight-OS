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
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractEditData
from core.signals import (
    delete_file_on_delete, delete_file_on_change,
)
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDataset
)
from core.models.general import AbstractFileCleanup


class LogStatus(object):
    """Quick access for coupling variable with Log status string."""

    WAITING_FILES = 'Waiting files'
    START = 'Start'
    RUNNING = 'Running'
    FAILED = 'Failed'
    SUCCESS = 'Success'


class ReferenceDatasetImporter(AbstractFileCleanup, AbstractEditData):
    """Reference Layer view importer."""

    reference_layer = models.ForeignKey(
        ReferenceDataset, on_delete=models.CASCADE
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

    def __str__(self):
        """Return str."""
        return f'{self.start_time} - {self.creator}'

    def run(self):
        """Run the importer."""
        from geosight.reference_dataset.tasks import run_importer
        if self.status is not LogStatus.RUNNING:
            run_importer.delay(self.id)

    class Meta:  # noqa: D106
        app_label = 'geosight_reference_dataset'


class ReferenceDatasetImporterLevel(AbstractFileCleanup):
    """Reference Layer view importer per level."""

    importer = models.ForeignKey(
        ReferenceDatasetImporter, on_delete=models.CASCADE
    )
    level = models.IntegerField(
        null=True, blank=True
    )
    file_id = models.CharField(
        max_length=256,
        null=True, blank=True
    )
    file = models.FileField(
        upload_to='reference-dataset/importers',
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
        app_label = 'geosight_reference_dataset'

    def get_properties(self):
        """Return properties."""
        from geosight.reference_dataset.utils.fiona import (
            open_collection_by_file, check_layer_type
        )
        if not self.properties:
            features = open_collection_by_file(
                self.file, check_layer_type(self.file.name)
            )
            try:
                self.properties = list(features[0].properties.keys())
                if not self.name_field:
                    self.name_field = self.properties[0]
                if not self.ucode_field:
                    self.ucode_field = self.properties[0]
                if not self.parent_ucode_field:
                    self.parent_ucode_field = self.properties[0]
                self.save()
            except AttributeError:
                pass
        return self.properties if self.properties else []


@receiver(models.signals.post_delete, sender=ReferenceDatasetImporterLevel)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """Delete file from filesystem.

    when corresponding `MediaFile` object is deleted.
    """
    delete_file_on_delete(sender, instance, **kwargs)


@receiver(models.signals.pre_save, sender=ReferenceDatasetImporterLevel)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """Delete old file from filesystem.

    when corresponding `MediaFile` object is updated
    with new file.
    """
    delete_file_on_change(sender, instance, **kwargs)
