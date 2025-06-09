"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'Víctor González'
__date__ = '05/03/2025'
__copyright__ = ('Copyright 2023, Unicef')

from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import action

from core.api_utils import ApiTag
from geosight.data.api.v1.base import BaseApiV1ResourceReadOnly
from geosight.data.api.v1.indicator_value import IndicatorValueApiUtilities
from geosight.data.models import IndicatorValue
from geosight.data.models.indicator import Indicator
from geosight.data.serializer.indicator_value import IndicatorValueSerializer
from geosight.permission.access import read_data_permission_resource


class IndicatorDataViewSet(
    BaseApiV1ResourceReadOnly, IndicatorValueApiUtilities
):
    """indicator Data ViewSet."""

    model_class = IndicatorValue
    serializer_class = IndicatorValueSerializer
    non_filtered_keys = [
        'page', 'page_size', 'fields', 'extra_fields', 'permission',
        'attributes', 'version', 'frequency'
    ]

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

    def _get_indicator(self):
        """
        Retrieve the Indicator object based on URL parameter 'indicators_id'.

        Fetches the `Indicator` instance using the `indicators_id` from
        the view's keyword arguments. Raises a 404 error if not found.
        Also checks read permission for the current user on the indicator.

        :return: The requested Indicator instance.
        :rtype: Indicator
        """
        indicator_id = self.kwargs.get('indicators_id')
        indicator = get_object_or_404(
            Indicator.objects.filter(pk=indicator_id)
        )
        read_data_permission_resource(indicator, self.request.user)
        return indicator

    def _set_request(self):  # noqa DOC110, DOC103
        """
        Set request query parameters from POST data.

        Copies data from the POST body (`self.request.data`) into
        the GET query parameters (`self.request.GET`), allowing
        uniform access to parameters regardless of HTTP method.

        :return: None
        """
        self.request.GET = self.request.GET.copy()
        data = self.request.data.copy()
        for key, value in data.items():
            self.request.GET[key] = value

    def get_queryset(self):
        """
        Return the filtered queryset for the API view.

        This method retrieves the base queryset and filters it
        by the current indicator's ID.

        :return: A queryset filtered by indicator_id.
        :rtype: QuerySet
        """
        indicator = self._get_indicator()
        query = super().get_queryset()
        query = query.filter(
            indicator_id=indicator.id
        )
        return query

    @method_decorator(
        cache_page(60 * 60 * 24 * 7),  # cache 7 days
        name='list'
    )
    @method_decorator(
        cache_control(public=True, max_age=864000),
        name='dispatch'
    )
    @swagger_auto_schema(
        operation_id='indicator-data-list',
        tags=[ApiTag.INDICATOR],
        operation_description=
        'Return list of indicator data for the user.',
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

    @swagger_auto_schema(auto_schema=None)
    def post(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Handle POST request to list indicator values.

        This method processes POST requests to return a list of indicator
        values based on the request data and current context.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Response containing a list of indicator values.
        :rtype: rest_framework.response.Response
        """
        self._set_request()
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='indicator-data-detail',
        tags=[ApiTag.INDICATOR],
        operation_description=
        'Return detail of a indicator row for the user.',
        responses={
            200: openapi.Response(
                description="Resource fetching successful.",
                schema=IndicatorValueSerializer(many=False)
            )
        }
    )
    def retrieve(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve a single indicator row by its identifier.

        This method handles fetching one specific indicator object,
        usually identified by the URL parameter (e.g., `pk`).

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments, typically including `pk`.
        :return: Response containing the serialized indicator object.
        :rtype: rest_framework.response.Response
        """
        return super().retrieve(self, request, *args, **kwargs)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def ids(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve the list of IDs of the data.

        This GET endpoint returns the identifiers of the data entries
        available in the current context.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Response containing a list of data IDs.
        :rtype: rest_framework.response.Response
        """
        return super().ids(request)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def values_string(self, request, *args, **kwargs):  # noqa DOC110, DOC103
        """
        Retrieve a list of string values from the data.

        This GET endpoint returns the data values represented as strings,
        suitable for display or text-based processing.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request
        :param args: Additional positional arguments.
        :param kwargs: Additional keyword arguments.
        :return: Response containing a list of string values.
        :rtype: rest_framework.response.Response
        """
        return super().values_string(request)

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
