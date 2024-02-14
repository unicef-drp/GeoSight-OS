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

import json

from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.indicator import Indicator
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.models.reference_layer_indicator_value import (
    reference_layer_indicator_values
)
from geosight.georepo.serializer.entity import (
    EntityCentroidSerializer
)
from geosight.georepo.serializer.reference_layer import (
    ReferenceLayerCentroidUrlSerializer
)


class ReferenceLayerCentroid(APIView):
    """Return ReferenceLayer centroid data."""

    def get(self, request, identifier, level):
        """Return BasemapLayer list."""
        view = get_object_or_404(
            ReferenceLayerView,
            identifier=identifier
        )
        entities = view.entity_set.filter(admin_level=level)
        return Response(
            EntityCentroidSerializer(entities, many=True).data
        )


class ReferenceLayerCentroidUrls(APIView):
    """Return ReferenceLayer centroid data."""

    def get(self, request, identifier):
        """Return BasemapLayer list."""
        view = get_object_or_404(
            ReferenceLayerView,
            identifier=identifier
        )
        return Response(
            ReferenceLayerCentroidUrlSerializer(view.levels, many=True).data
        )


class ReferenceLayerVectorTile(APIView):
    """Return ReferenceLayer vector tile data."""

    def get(self, request, identifier):
        """Return BasemapLayer list."""
        get_object_or_404(
            ReferenceLayerView,
            identifier=identifier
        )
        return Response('OK')


class ReferenceLayerEntityDrilldownAPI(APIView):
    """Return ReferenceLayer drilldown data."""

    def get(self, request, concept_uuid):
        """Return BasemapLayer list."""
        entity = Entity.objects.filter(concept_uuid=concept_uuid).first()
        if not Entity:
            return Response([])

        indicators = request.GET.get('indicators', '').split(',')
        data = reference_layer_indicator_values(
            entity.reference_layer,
            indicators=Indicator.objects.filter(id__in=[
                indicator for indicator in indicators if indicator
            ]),
            admin_level=entity.admin_level,
            concept_uuids=[concept_uuid]
        )
        try:
            return Response(json.loads(json.dumps(data[0])))
        except IndexError:
            return Response([])
