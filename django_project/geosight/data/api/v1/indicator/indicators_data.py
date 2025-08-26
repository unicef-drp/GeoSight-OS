"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Víctor González'
__date__ = '20/08/2025'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.exceptions import PermissionDenied
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1
from geosight.data.api.v1.indicator_value import IndicatorValueApiUtilities
from geosight.data.models import IndicatorValue
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator_value import IndicatorValueSerializer


class IndicatorsDataViewSet(
    BaseApiV1, IndicatorValueApiUtilities, viewsets.GenericViewSet,
    ListModelMixin
):
    """indicator Data ViewSet."""

    model_class = IndicatorValue
    serializer_class = IndicatorValueSerializer
    non_filtered_keys = [
        'page', 'page_size', 'fields', 'extra_fields', 'permission',
        'attributes', 'version', 'frequency', 'indicators_id__in',
        'last_value'
    ]

    @property
    def queryset(self):
        """
        Build and return the base queryset for this view.

        The queryset is restricted to ``IndicatorValue`` objects that belong to
        indicators the current user has permission to read. Optionally, the
        results can be filtered further by passing a comma-separated list of
        indicator IDs via the ``indicator_id__in`` query parameter.

        :raises PermissionDenied:
            If the user does not have permission to access any of the requested
            indicators.

        :return: A queryset of ``IndicatorValue`` objects filtered by user
                 permissions and optional request parameters.
        :rtype: django.db.models.QuerySet
        """
        indicators_id = []
        indicators_id__in = self.request.GET.get('indicator_id__in', None)
        if indicators_id__in:
            indicators_id = indicators_id__in.split(',')
        indicators = Indicator.permissions.read_data(self.request.user).filter(
            id__in=indicators_id
        )
        if not indicators:
            raise PermissionDenied("You do not have permission.")

        return IndicatorValue.objects.filter(
            indicator__in=indicators
        )

    @property
    def extra_exclude_fields(self):
        """
        Return extra fields to exclude based on the current action.

        When the current action is 'retrieve', no extra fields are excluded.
        For other actions, returns the list of non-filtered keys.

        :return: List of field names to exclude.
        :rtype: list[str]
        """
        if self.action == 'retrieve':
            return []
        else:
            return self.non_filtered_keys

    def get_queryset(self):
        """
        Return the filtered queryset for the API view.

        This method retrieves the base queryset and filters it
        by the current indicator's ID.

        :return: A queryset filtered by indicator_id.
        :rtype: QuerySet
        """
        query = super().get_queryset()
        return query

    @swagger_auto_schema(
        operation_id='indicators-data-list',
        tags=[ApiTag.INDICATOR],
        operation_description=
        'Return list of indicators data for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=IndicatorValueSerializer(many=True)
            )
        }
    )
    def list(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve a list of indicator rows.

        This method handles GET requests to return a collection of indicator
        objects, typically paginated.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Response containing a list of indicator rows.
        :rtype: rest_framework.response.Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(method='get', auto_schema=None)
    @swagger_auto_schema(method='post', auto_schema=None)
    @action(detail=False, methods=['get', 'post'])
    def values(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve the values of the data.

        This endpoint supports both GET and POST requests and returns
        the relevant data values based on the current request context.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Response containing the data values.
        :rtype: rest_framework.response.Response
        """
        self._set_request()
        return super().values(request)

    @swagger_auto_schema(method='get', auto_schema=None)
    @swagger_auto_schema(method='post', auto_schema=None)
    @action(detail=False, methods=['get', 'post'])
    def statistic(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve statistics of the data.

        This endpoint supports both GET and POST methods.
        It returns a dictionary containing the keys `min`, `max`, and `avg`
        representing respective statistical values computed from the dataset.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return:
            Response containing statistical
            summary with keys 'min', 'max', and 'avg'.
        :rtype: rest_framework.response.Response
        """
        self._set_request()
        return super().statistic(request)
