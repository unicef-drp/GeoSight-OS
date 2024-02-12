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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.shortcuts import get_object_or_404
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from core.api.base import FilteredAPI
from core.auth import BearerAuthentication
from core.pagination import Pagination
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.serializer.entity import ApiEntitySerializer


class EntityApiList(FilteredAPI, ListAPIView):
    """Return Entity API List."""

    authentication_classes = [
        SessionAuthentication, BasicAuthentication, BearerAuthentication
    ]
    permission_classes = (IsAuthenticated,)
    pagination_class = Pagination
    model = Entity
    serializer_class = ApiEntitySerializer

    def get_queryset(self):
        """Return queryset of API."""
        view = get_object_or_404(
            ReferenceLayerView,
            identifier=self.kwargs.get('view_identifier', '')
        )
        query = view.entity_set.all()
        query = self.filter_query(
            self.request, query, ['page', 'page_size']
        )
        return query
