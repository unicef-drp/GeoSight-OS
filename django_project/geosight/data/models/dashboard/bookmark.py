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

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractTerm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard.dashboard import Dashboard

User = get_user_model()


class DashboardBookmarkAbstract(models.Model):
    """Dashboard bookmark abstract."""

    extent = models.PolygonField(
        blank=True, null=True,
        help_text=_('Extent of the dashboard. If empty, it is the whole map')
    )
    filters = models.TextField(
        blank=True, null=True
    )
    selected_basemap = models.ForeignKey(
        BasemapLayer,
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    selected_indicator_layers = models.JSONField(
        null=True, blank=True, default=list
    )
    selected_context_layers = models.ManyToManyField(
        ContextLayer, blank=True
    )
    indicator_layer_show = models.BooleanField(default=True)
    context_layer_show = models.BooleanField(default=True)
    selected_admin_level = models.FloatField(null=True, blank=True)
    is_3d_mode = models.BooleanField(default=False)
    position = models.JSONField(null=True, blank=True)

    # TODO:
    #  Deprecated
    selected_indicator_layer = models.ForeignKey(
        "DashboardIndicatorLayer",
        null=True, blank=True,
        on_delete=models.SET_NULL
    )

    class Meta:  # noqa: D106
        abstract = True


class DashboardBookmark(DashboardBookmarkAbstract, AbstractTerm):
    """Bookmark model for dashboard."""

    dashboard = models.ForeignKey(
        Dashboard,
        on_delete=models.CASCADE
    )
    creator = models.ForeignKey(
        User,
        null=True, blank=True,
        help_text=_('User who create the bookmark.'),
        on_delete=models.SET_NULL
    )

    def able_to_edit(self, user):
        """If able to edit."""
        from core.models.profile import ROLES
        return user.profile.role == ROLES.SUPER_ADMIN.name or \
            user == self.creator

    class Meta:  # noqa: D106
        unique_together = ('dashboard', 'name')
        ordering = ('name',)

    def save_relations(self, data):
        """Save all relationship data."""
        from geosight.data.models import ContextLayer
        try:
            for row in data['selectedContextLayers']:
                self.selected_context_layers.add(
                    ContextLayer.objects.get(id=row)
                )
        except ContextLayer.DoesNotExist:
            raise Exception('Context layer does not exist')
