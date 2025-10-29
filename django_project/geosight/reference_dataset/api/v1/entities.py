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

from itertools import chain

from django.contrib.postgres.aggregates import ArrayAgg
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer

from core.api_utils import common_api_params, ApiParams
from core.pagination import Pagination, GeojsonPagination
from core.renderers import GeoJSONRenderer
from geosight.data.api.v1.base import BaseApiV1
from geosight.georepo.models.entity import Entity
from geosight.georepo.serializer.entity import (
    ApiEntitySerializer, ApiEntityGeoSerializer
)
from geosight.permission.access import read_data_permission_resource
from geosight.reference_dataset.api.v1.api_utils import (
    ApiTag as ReferenceApiTag,
    ApiParams as ReferenceApiParams,
)
from geosight.reference_dataset.models import ReferenceDataset


class EntityViewSet(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Reference dataset set."""

    serializer_class = ApiEntitySerializer
    lookup_field = 'geom_id'
    lookup_value_regex = '[^/]+'

    query_search_fields = ['name', 'geom_id']

    @property
    def queryset(self):
        """Get queryset of entities by countries from reference datasets.

        :return:
            Queryset of Entity objects filtered by user-accessible countries.
        :rtype: QuerySet
        """
        country_lists = ReferenceDataset.objects.annotate(
            country_list=ArrayAgg('countries')
        ).values_list('country_list', flat=True)

        countries = list(
            chain.from_iterable(filter(None, country_lists))
        )
        return Entity.objects.by_countries(countries)

    @swagger_auto_schema(
        operation_id='reference-datasets-entity-list',
        tags=[ReferenceApiTag.REFERENCE_DATASET],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ReferenceApiParams.CONCEPT_UUID,
            ApiParams.ADMIN_LEVEL,
        ],
        operation_description=(
                'Return list of accessed entity of '
                'reference dataset for the user.'
        )
    )
    def list(self, request, *args, **kwargs):  # noqa DOC103
        """
        List all accessible entities related to reference datasets.

        :param request: The HTTP request object.
        :type request: Request
        :return: Paginated list of Entity objects.
        :rtype: Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='reference-datasets-entity-detail',
        tags=[ReferenceApiTag.REFERENCE_DATASET],
        manual_parameters=[],
        operation_description=(
                'Return detailed of entity of reference dataset.'
        )
    )
    def retrieve(self, request, *args, **kwargs):  # noqa DOC103
        """
        Retrieve details of a specific entity by geom_id.

        :param request: The HTTP request object.
        :type request: Request
        :param kwargs: Should contain `geom_id` for lookup.
        :return: Serialized representation of the Entity object.
        :rtype: Response
        """
        return super().retrieve(request, geom_id=kwargs['geom_id'])


class EntityReferenceDatasetViewSet(BaseApiV1, viewsets.ReadOnlyModelViewSet):
    """Reference dataset view set."""

    serializer_class = ApiEntitySerializer
    lookup_field = 'geom_id'
    lookup_value_regex = '[^/]+'
    renderer_classes = [GeoJSONRenderer, JSONRenderer, BrowsableAPIRenderer]

    @property
    def pagination_class(self):
        """Return dynamic pagination class based on format."""
        format = self.request.query_params.get('format')
        if format == 'geojson':
            return GeojsonPagination
        return Pagination

    def get_serializer_class(self):
        """
        Get the appropriate serializer class based on the requested format.

        This method checks the ``format`` query parameter in the request.
        If the format is set to ``geojson``, it returns the
        :class:`ApiEntityGeoSerializer`; otherwise, it returns the
        default :class:`ApiEntitySerializer`.

        :return: The serializer class to be used for the current request.
        :rtype: type[rest_framework.serializers.Serializer]
        """
        format = self.request.query_params.get('format')
        if format == 'geojson':
            return ApiEntityGeoSerializer
        return ApiEntitySerializer

    @property
    def queryset(self):  # noqa DOC103
        """Get queryset of entities belonging to a specific reference dataset.

        Checks for user access permissions on the dataset before returning.

        :raises Http404:
            If the reference dataset with the given identifier is not found.
        :raises PermissionDenied:
            If the user does not have access to the dataset.

        :return: Queryset of Entity objects.
        :rtype: QuerySet
        """
        view = get_object_or_404(
            ReferenceDataset,
            identifier=self.kwargs.get('identifier', '')
        )
        read_data_permission_resource(view, self.request.user)
        return view.entities_set.all()

    @swagger_auto_schema(
        operation_id='reference-datasets-detail-entity-list',
        tags=[ReferenceApiTag.REFERENCE_DATASET],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ReferenceApiParams.CONCEPT_UUID,
            ApiParams.ADMIN_LEVEL,
        ],
        operation_description=(
                'Return list of accessed entity of '
                'reference dataset for the user.'
        )
    )
    def list(self, request, *args, **kwargs):  # noqa DOC103
        """List all entities within a specific reference dataset.

        :param request: The HTTP request object.
        :type request: Request
        :return: Paginated list of Entity objects.
        :rtype: Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='reference-datasets-detail-entity-detail',
        tags=[ReferenceApiTag.REFERENCE_DATASET],
        manual_parameters=[],
        operation_description=(
                'Return detailed of entity of reference dataset.'
        )
    )
    def retrieve(self, request, *args, **kwargs):  # noqa DOC103
        """Retrieve details of an entity in a reference dataset by geom_id.

        :param request: The HTTP request object.
        :type request: Request
        :param kwargs: Should contain `geom_id` for lookup.
        :return: Serialized representation of the Entity object.
        :rtype: Response
        """
        return super().retrieve(request, geom_id=kwargs['geom_id'])
