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
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from core.models import AbstractEditData, AbstractTerm, IconTerm
from geosight.permission.models.manager import PermissionManager


class BasemapLayerType(object):
    """A quick couple of variable and Basemap Layer type."""

    XYZ_TILE = 'XYZ Tile'
    WMS = 'WMS'


class BasemapGroup(AbstractTerm):
    """The group of basemap."""

    pass


class BasemapLayer(AbstractEditData, AbstractTerm, IconTerm):
    """Model of BasemapLayer."""

    url = models.CharField(
        max_length=256
    )
    type = models.CharField(
        max_length=256,
        default=BasemapLayerType.XYZ_TILE,
        choices=(
            (BasemapLayerType.XYZ_TILE, BasemapLayerType.XYZ_TILE),
            (BasemapLayerType.WMS, BasemapLayerType.WMS),
        )
    )
    group = models.ForeignKey(
        BasemapGroup,
        on_delete=models.SET_NULL,
        blank=True, null=True
    )
    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        ordering = ('name',)

    def update_dashboard_version(self):
        """Update dashboard version."""
        from django.utils import timezone
        from geosight.data.models.dashboard import Dashboard
        Dashboard.objects.filter(
            id__in=self.dashboardbasemap_set.values_list(
                'dashboard', flat=True
            )
        ).update(
            version_data=timezone.now(), cache_data=None,
            cache_data_generated_at=None
        )

    @property
    def category(self):
        """Return category."""
        return self.group.name if self.group else ''


@receiver(post_save, sender=BasemapLayer)
def increase_version(sender, instance, **kwargs):  # noqa: DOC101,DOC103
    """Increase version of dashboard signal."""
    instance.update_dashboard_version()


class BasemapLayerParameter(models.Model):
    """Additional parameter for basemap layer."""

    basemap_layer = models.ForeignKey(
        BasemapLayer, on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=128,
        help_text=_(
            "The name of parameter"
        )
    )
    value = models.CharField(
        max_length=128,
        null=True, blank=True,
        help_text=_(
            "The value of parameter"
        )
    )

    class Meta:  # noqa: D106
        unique_together = ('basemap_layer', 'name')

    def __str__(self):
        return f'{self.name}'
