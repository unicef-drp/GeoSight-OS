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
__date__ = '06/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from cloud_native_gis.forms.layer import LayerForm
from rest_framework.response import Response

from geosight.cloud_native_gis.models import (
    CloudNativeGISLayer
)
from geosight.cloud_native_gis.serializer import CloudNativeGISLayerSerializer
from geosight.data.api.v1.base import BaseApiV1Resource


class CloudNativeGISLayerViewSet(BaseApiV1Resource):
    """API for CloudNativeGISLayer."""

    model_class = CloudNativeGISLayer
    form_class = LayerForm
    serializer_class = CloudNativeGISLayerSerializer
    extra_exclude_fields = ['parameters']

    def delete(self, request):
        """Delete layer in batch."""
        ids = json.loads(request.data['ids'])
        for obj in CloudNativeGISLayer.permissions.delete(request.user).filter(
                id__in=ids):
            obj.delete()
        return Response('Deleted')
