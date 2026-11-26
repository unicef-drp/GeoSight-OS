# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'ishaan.jain@emory.edu'
__date__ = '22/01/2026'
__copyright__ = ('Copyright 2026, Unicef')

from django.contrib.gis.db import models

from core.models.general import AbstractTerm, IconTerm
from geosight.data.models.dashboard.bookmark import DashboardBookmark
from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelationWithLimit
)


class DashboardStory(AbstractTerm, IconTerm, DashboardRelationWithLimit):
    """Dashboard story model."""

    # Deleting a bookmark keeps the story page, without a map state.
    bookmark = models.ForeignKey(
        DashboardBookmark,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    config = models.JSONField(null=True, blank=True)

    # The "Default" bookmark (the project's default view) is not a saved
    # bookmark: the bookmark API lists it with id 0. A page that uses it
    # has no bookmark and this flag in its config.
    DEFAULT_BOOKMARK_ID = 0
    DEFAULT_BOOKMARK_KEY = 'default_bookmark'

    content_limitation_description = (
        'Limit the number of stories per project'
    )

    def __str__(self):
        return self.name

    @property
    def bookmark_value(self):
        """
        Return the bookmark of the page for the frontend.

        :return: The bookmark ID, 0 for the "Default" view, or None.
        :rtype: int or None
        """
        if self.bookmark_id:
            return self.bookmark_id
        if (self.config or {}).get(self.DEFAULT_BOOKMARK_KEY):
            return self.DEFAULT_BOOKMARK_ID
        return None

    class Meta:  # noqa: D106
        ordering = ('order',)
