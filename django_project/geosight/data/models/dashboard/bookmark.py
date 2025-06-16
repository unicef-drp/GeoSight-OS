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
    indicator_layer_show = models.BooleanField(default=True)
    selected_admin_level = models.FloatField(null=True, blank=True)
    is_3d_mode = models.BooleanField(default=False)
    position = models.JSONField(null=True, blank=True)

    # Selected context layers
    context_layer_show = models.BooleanField(default=True)
    selected_context_layers = models.ManyToManyField(
        ContextLayer, blank=True
    )
    context_layers_config = models.JSONField(null=True, blank=True)

    # TransparencySlider
    transparency_config = models.JSONField(
        default={
            'indicatorLayer': 100,
            'contextLayer': 100,
        }
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
        """
        Determine whether the given user has permission to edit this object.

        The user can edit if:
        - They are a superuser,
        - Their profile role is SUPER_ADMIN, or
        - They are the creator of the object.

        :param user: The user whose permissions are being checked.
        :type user: django.contrib.auth.models.User
        :return: True if the user has edit permissions, False otherwise.
        :rtype: bool
        """
        from core.models.profile import ROLES
        return (
                user.is_superuser or
                user.profile.role == ROLES.SUPER_ADMIN.name or
                user == self.creator
        )

    class Meta:  # noqa: D106
        unique_together = ('dashboard', 'name')
        ordering = ('name',)

    def save_relations(self, data):
        """
        Save related context layers from the provided data.

        This method adds `ContextLayer` instances (identified by their IDs)
        from the `data['selected_context_layers']` list to the
        `selected_context_layers` relationship field of the current instance.

        :param data: Dictionary containing the selected context layer IDs.
        :type data: dict

        :raises Exception: If any provided context layer ID does not exist.
        """
        from geosight.data.models import ContextLayer
        try:
            for row in data['selected_context_layers']:
                self.selected_context_layers.add(
                    ContextLayer.objects.get(id=row)
                )
        except ContextLayer.DoesNotExist:
            raise Exception('Context layer does not exist')
