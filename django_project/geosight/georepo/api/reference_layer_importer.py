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
__date__ = '22/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import mixins, GenericViewSet

from geosight.data.api.v1.base import BaseApiV1
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView
)
from geosight.georepo.models.reference_layer_importer import (
    ReferenceLayerViewImporter, ReferenceLayerViewImporterLevel
)
from geosight.georepo.serializer.reference_layer_importer import (
    ReferenceLayerViewImporterSerializer,
    ReferenceLayerViewImporterLevelSerializer
)


class ReferenceLayerImporter(
    BaseApiV1,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet
):
    """Return importers."""

    serializer_class = ReferenceLayerViewImporterSerializer

    @property
    def queryset(self):
        """Return the queryset."""
        return ReferenceLayerViewImporter.objects.all().order_by('-created_at')


class ReferenceLayerImporterFileView(APIView):
    """Import file for importer."""

    parser_classes = (MultiPartParser,)

    def post(self, request, identifier):
        """Post file."""
        layer = get_object_or_404(ReferenceLayerView, identifier=identifier)
        layer.able_to_edit(request.user)
        created_at = request.data.get('createdAt', '')
        importer, _ = ReferenceLayerViewImporter.objects.get_or_create(
            reference_layer=layer,
            creator=self.request.user,
            created_at=created_at
        )
        level_obj, _ = ReferenceLayerViewImporterLevel.objects.get_or_create(
            importer=importer,
            file_id=request.data.get('id', '')
        )
        level_obj.file = request.FILES['file']
        level_obj.save()
        level_obj.get_properties()

        return Response(
            ReferenceLayerViewImporterLevelSerializer(level_obj).data
        )


class ReferenceLayerRearrangeView(APIView):
    """Rearrange data."""

    def post(self, request, identifier):
        """Post file."""
        layer = get_object_or_404(ReferenceLayerView, identifier=identifier)
        layer.able_to_edit(request.user)
        importer = get_object_or_404(
            ReferenceLayerViewImporter,
            reference_layer=layer,
            creator=self.request.user,
            created_at=request.data.get('createdAt', '')
        )
        orders = request.data.get('orders', '')
        if orders:
            for level, file_id in enumerate(orders):
                try:
                    obj = importer.referencelayerviewimporterlevel_set.get(
                        file_id=file_id
                    )
                    obj.level = level
                    obj.save()
                except ReferenceLayerViewImporterLevel.DoesNotExist:
                    pass

        return Response(status=204)


class ReferenceLayerImporterFileUpdateView(APIView):
    """Rearrange data."""

    def post(self, request, identifier):
        """Post file."""
        layer = get_object_or_404(ReferenceLayerView, identifier=identifier)
        layer.able_to_edit(request.user)
        importer = get_object_or_404(
            ReferenceLayerViewImporter,
            reference_layer=layer,
            creator=self.request.user,
            created_at=request.data.get('createdAt', '')
        )
        level_importer = get_object_or_404(
            ReferenceLayerViewImporterLevel,
            importer=importer,
            file_id=request.data.get('id', '')
        )
        setattr(
            level_importer, request.data.get('name', ''),
            request.data.get('value', '')
        )
        level_importer.save()
        return Response(status=204)
