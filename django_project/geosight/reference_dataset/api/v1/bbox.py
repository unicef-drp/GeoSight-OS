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
__date__ = '23/03/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db.models import Extent
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.permission.access import read_data_permission_resource
from geosight.reference_dataset.api.v1.api_utils import (
    ApiTag as ReferenceApiTag,
)
from geosight.reference_dataset.models import ReferenceDataset


class ReferenceDatasetBboxByConcept(APIView):
    """Return bbox of entities in a reference dataset filtered by concept_uuid.

    POST body: list of concept_uuids (JSON array of strings).
    Returns: [minx, miny, maxx, maxy] or 404 if no matching geometries.
    """

    @swagger_auto_schema(
        operation_id='reference-datasets-operation-bbox',
        tags=[ReferenceApiTag.REFERENCE_DATASET],
        manual_parameters=[],
        operation_description='Return bbox of reference dataset entities.'
    )
    def post(self, request, identifier):
        """Return combined bbox for the given concept_uuids.

        :param request: The HTTP request containing a JSON list of
            concept_uuids in the body.
        :type request: Request
        :param identifier: The reference dataset identifier.
        :type identifier: str
        :return: Bounding box as [minx, miny, maxx, maxy], or [] if none.
        :rtype: Response
        """
        view = get_object_or_404(ReferenceDataset, identifier=identifier)
        read_data_permission_resource(view, request.user)

        concept_uuids = request.data
        if not isinstance(concept_uuids, list):
            concept_uuids = []

        qs = view.entities_set.filter(
            concept_uuid__in=concept_uuids,
            geometry__isnull=False,
        )
        result = qs.aggregate(extent=Extent('geometry'))
        bbox = result.get('extent')
        if not bbox:
            return Response([])

        return Response(list(bbox))
