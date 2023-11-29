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

from core.api.base import FilteredAPI
from core.auth import BearerAuthentication
from core.pagination import Pagination


class BaseApiV1(FilteredAPI):
    """Base API V1."""

    authentication_classes = [
        SessionAuthentication, BasicAuthentication, BearerAuthentication
    ]
    pagination_class = Pagination

    def get_queryset(self):
        """Return queryset of API."""
        query = self.queryset
        return self.filter_query(
            self.request, query, ['page', 'page_size']
        )
