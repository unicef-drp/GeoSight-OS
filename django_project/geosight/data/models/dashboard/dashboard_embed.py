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

import random
import string

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models

from core.models.general import AbstractEditData
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.dashboard.bookmark import DashboardBookmarkAbstract

User = get_user_model()


def id_generator(
        size=16,
        chars=string.ascii_letters + string.digits + '+_-'
):
    """ID Generator."""
    return ''.join(random.choice(chars) for _ in range(size))


class DashboardEmbed(DashboardBookmarkAbstract, AbstractEditData):
    """Dashboard embed."""

    code = models.TextField(max_length=16, unique=True)
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    layer_tab = models.BooleanField(default=True)
    filter_tab = models.BooleanField(default=True)
    map = models.BooleanField(default=True)
    widget_tab = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        """Save model."""
        if not self.code:
            self.code = id_generator()
        return super().save(*args, **kwargs)
