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
__date__ = '28/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.viewsets import mixins, GenericViewSet

from geosight.data.api.v1.base import BaseApiV1
from geosight.tenants.models.content_limitation import ContentLimitation
from geosight.tenants.permission import AccessedJustByPublicTenant
from geosight.tenants.serializer import ContentLimitationSerializer


class ContentLimitationAPI(
    BaseApiV1,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet
):
    """Return tenants list."""

    permission_classes = (
        IsAuthenticated, IsAdminUser, AccessedJustByPublicTenant
    )
    model_class = ContentLimitation
    serializer_class = ContentLimitationSerializer
    queryset = ContentLimitation.objects.all()
