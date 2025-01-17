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

from core.signals import (
    delete_file_on_delete, delete_file_on_change,
)
from geosight.importer.models.importer import Importer
from core.models.general import AbstractFileCleanup


class ImporterAttribute(AbstractFileCleanup):
    """EAV for additional attribute for importer."""

    importer = models.ForeignKey(Importer, on_delete=models.CASCADE)
    name = models.CharField(
        max_length=512,
        help_text=_("The name of attribute")
    )
    value = models.TextField(
        null=True, blank=True,
        help_text=_("The value of attribute")
    )
    file = models.FileField(
        upload_to='importers/attributes',
        null=True, blank=True,
        help_text=_("The file of attribute")
    )

    class Meta:  # noqa: D106
        unique_together = ('importer', 'name')

    def __str__(self):
        """Return str."""
        return f'{self.name}'


class ImporterMapping(models.Model):
    """EAV for additional attribute for importer."""

    importer = models.ForeignKey(Importer, on_delete=models.CASCADE)
    name = models.CharField(
        max_length=512,
        help_text=_("The name of attribute")
    )
    value = models.TextField(
        null=True, blank=True,
        help_text=_("The value of attribute")
    )

    def __str__(self):
        """Return str."""
        return f'{self.name}'


@receiver(models.signals.post_delete, sender=ImporterAttribute)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """Delete file from filesystem.

    when corresponding `MediaFile` object is deleted.
    """
    delete_file_on_delete(sender, instance, **kwargs)


@receiver(models.signals.pre_save, sender=ImporterAttribute)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """Delete old file from filesystem.

    when corresponding `MediaFile` object is updated
    with new file.
    """
    delete_file_on_change(sender, instance, **kwargs)
