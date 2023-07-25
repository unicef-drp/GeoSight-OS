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

from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models.indicator import Indicator
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import (
    ReferenceLayer
)
from geosight.georepo.models.reference_layer_indicator_value import (
    reference_layer_indicator_values
)
from geosight.georepo.request.request import GeorepoRequest


class ReferenceLayerListAPI(APIView):
    """Return ReferenceLayer list."""

    def get(self, request):
        """Return BasemapLayer list."""
        reference_layers = GeorepoRequest().get_reference_layer_list()
        for reference_layer in reference_layers:
            obj, _ = ReferenceLayer.objects.get_or_create(
                identifier=reference_layer['uuid'],
                defaults={
                    'name': reference_layer['name']
                }
            )
            reference_layer['id'] = obj.id
        return Response(reference_layers)


class ReferenceLayerDetailAPI(APIView):
    """Return ReferenceLayer Detail."""

    def get(self, request, identifier):
        """Return BasemapLayer list."""
        return Response(
            GeorepoRequest().get_reference_layer_detail(identifier)
        )


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
