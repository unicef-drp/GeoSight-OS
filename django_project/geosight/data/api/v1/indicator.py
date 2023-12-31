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
__date__ = '29/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import viewsets

from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator import (
    IndicatorBasicListSerializer
)
from .base import BaseApiV1


class IndicatorViewSet(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Indicator view set."""

    serializer_class = IndicatorBasicListSerializer

    @property
    def queryset(self):
        """Return the queryset."""
        return Indicator.permissions.list(self.request.user)
