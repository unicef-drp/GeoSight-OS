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

from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
from rest_framework.permissions import IsAuthenticated

from core.api.base import FilteredAPI
from core.auth import BearerAuthentication
from core.pagination import Pagination
from geosight.data.api.v1.base import BaseApiV1
from geosight.data.models.indicator import (
    Indicator, IndicatorValue
)


class BaseIndicatorValueApi(FilteredAPI):
    """Return indicator value api list."""

    authentication_classes = [
        SessionAuthentication, BasicAuthentication, BearerAuthentication
    ]
    permission_classes = (IsAuthenticated,)
    pagination_class = Pagination
    model = IndicatorValue
    filter_query_exclude = BaseApiV1.non_filtered_keys
    extra_exclude_fields = []

    def get_queryset(self):
        """Return indicator value with geo."""
        query = None
        is_admin = False
        try:
            if self.request.user.profile.is_admin:
                query = self.model.objects.all()
                is_admin = True
        except AttributeError:
            pass

        # If not admin
        if not is_admin:
            indicators = Indicator.permissions.read_data(
                user=self.request.user
            ).values_list(
                'id', flat=True
            )
            if not indicators.count():
                query = self.model.objects.none()
            else:
                query = self.model.objects.filter(
                    indicator_id__in=indicators
                )

        # Filter by parameters
        query = self.filter_query(
            self.request, query, self.filter_query_exclude,
            sort='id'
        )
        return query
