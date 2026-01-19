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
__date__ = '29/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.core.exceptions import SuspiciousOperation
from django.http import HttpResponseBadRequest
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from core.utils import string_is_true
from geosight.data.api.v1.base import BaseApiV1
from geosight.data.api.v1.indicator_value import IndicatorValueApiUtilities
from geosight.data.models.indicator import (
    Indicator, IndicatorValue, IndicatorValueRejectedError
)
from geosight.data.serializer.indicator import IndicatorValueSerializer
from .base import BaseIndicatorValueApi


class BaseDataBrowserApiList(
    BaseIndicatorValueApi,
    IndicatorValueApiUtilities
):
    """Return Data List API List."""

    serializer_class = IndicatorValueSerializer
    filter_query_exclude = BaseApiV1.non_filtered_keys + [
        'group_admin_level', 'detail', 'frequency',
        'time', 'geometry_code'
    ]
    extra_exclude_fields = ['permission']
    default_sort = 'id'

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance with adjusted fields or exclusions.

        This method determines the serializer class and context, and modifies 
        the fields or exclusions based on the request parameters. It supports 
        dynamic inclusion or exclusion of fields for the 'list' action.

        :param args: Positional arguments passed to the serializer.
        :param kwargs: Keyword arguments passed to the serializer.
            - 'fields': A comma-separated list of fields to include in the 
              serializer.
            - 'exclude': A list of fields to exclude from the serializer.
            - 'extra_fields': A comma-separated list of fields to include even 
              if they are in the exclusion list.

        :return: An instance of the serializer class.
        :rtype: Serializer
        """
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())

        if self.action in ['list']:
            fields = self.request.GET.get('fields')
            if not fields:
                kwargs['exclude'] = ['creator'] + self.extra_exclude_fields
                extra_fields = self.request.GET.get('extra_fields')
                if extra_fields:
                    for extra_field in extra_fields.split(','):
                        try:
                            kwargs['exclude'].remove(extra_field)
                        except Exception:
                            pass
            elif fields != '__all__':
                kwargs['fields'] = self.request.GET.get('fields').split(',')

        return serializer_class(*args, **kwargs)


class DataBrowserApiList(
    BaseDataBrowserApiList, viewsets.ReadOnlyModelViewSet
):
    """Return Data List API List."""

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer for the data.

        If the 'detail' query parameter in the request is not set to 'true',
        the 'permission' field will be excluded from the serializer.

        :param args: Positional arguments passed to the serializer.
        :param kwargs: Keyword arguments passed to the serializer. If 'detail'
            is not 'true', the 'exclude' key will be set to exclude
            the 'permission' field.
        :return: An instance of the serializer class with the provided context
            and arguments.
        """
        if not string_is_true(self.request.GET.get('detail', 'false')):
            kwargs['exclude'] = ['permission']
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    def get_serializer_context(self):
        """
        Extend the serializer context with additional data.

        This method overrides the `get_serializer_context` method to include
        the current user in the serializer context.

        Returns:
            dict: The updated serializer context containing the default context
            and the current user.
        """
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    @swagger_auto_schema(
        operation_id='data-browser-list',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[
            *common_api_params,
            ApiParams.INDICATOR_ID,
            ApiParams.INDICATOR_SHORTCODE,
            ApiParams.DATASET_UUID,
            ApiParams.ADMIN_LEVEL,
            ApiParams.GEOM_ID,
            ApiParams.DATE_FROM,
            ApiParams.DATE_TO,
        ]
    )
    def list(self, request, *args, **kwargs):
        """
        List of dashboard.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :param args: Additional positional arguments.
        :type args: tuple
        :param kwargs: Additional keyword arguments.
        :type kwargs: dict
        :return: The HTTP response containing the list of dashboard data or
            a bad request response.
        :rtype: HttpResponse
        :raises SuspiciousOperation: If a suspicious operation is detected.
        """
        try:
            return super().list(request, *args, **kwargs)
        except SuspiciousOperation as e:
            return HttpResponseBadRequest(f'{e}')

    @swagger_auto_schema(
        operation_id='data-browser-create',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[],
        request_body=IndicatorValueSerializer.
        Meta.post_body,
        responses={
            201: ''
        }
    )
    def post(self, request):
        """
        Handle POST request to save a new value for an indicator.

        :param request: The HTTP request object containing the data payload.
        :type request: HttpRequest

        :raises HttpResponseBadRequest: If `indicator_id` or
            `indicator_shortcode` is not provided in the payload.
        :raises HttpResponseBadRequest: If the specified indicator
            does not exist.
        :raises HttpResponseBadRequest: If a required key is missing
            in the payload.
        :raises HttpResponseBadRequest: For any other exceptions that
            occur during processing.

        :return: HTTP response with status 201 if
            the value is successfully saved.
        :rtype: Response
        """
        try:
            data = request.data
            if not data.get('indicator_id', 0) and not data.get(
                    'indicator_shortcode', None):
                return HttpResponseBadRequest(
                    'indicator_id or indicator_shortcode is required'
                )

            try:
                indicator = Indicator.objects.get(
                    id=data.get('indicator_id', 0)
                )
            except Indicator.DoesNotExist:
                try:
                    indicator = Indicator.objects.get(
                        shortcode=data.get('indicator_shortcode', '')
                    )
                except Indicator.DoesNotExist:
                    return HttpResponseBadRequest('Indicator does not exist')
            indicator.save_value(
                date=data['date'],
                geom_id=data['geom_id'],
                reference_layer=data['dataset_uuid'],
                admin_level=data['admin_level'],
                value=data['value'],
                extras=data.get('attributes', {})
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e} is required on payload')
        except Exception as e:
            return HttpResponseBadRequest(f'{e}')
        return Response(status.HTTP_201_CREATED)

    @swagger_auto_schema(auto_schema=None)
    def put(self, request):
        """
        Batch update the value of data.

        This method processes a batch update request for
        `IndicatorValue` objects. It validates the data, checks user
        permissions, and updates the values accordingly.

        :param request: The HTTP request object containing
            the batch update data.
        :type request: HttpRequest

        :raises HttpResponseBadRequest: If the `data` key is missing
            in the payload or if an `IndicatorValueRejectedError` occurs.

        :return: A response indicating the success or
            failure of the operation.
        :rtype: Response
        """
        try:
            data = request.data
            try:
                data = request.data['data']
                data = json.loads(request.data['data'])
            except TypeError:
                pass
            for row in data:
                try:
                    value = IndicatorValue.objects.get(id=row['id'])
                    if value.permissions(request.user)['edit']:
                        edited_value = row['value']
                        value.indicator.validate(edited_value)
                        value.value = edited_value
                        value.save()
                except (IndicatorValue.DoesNotExist, ValueError):
                    pass
                except IndicatorValueRejectedError as e:
                    return HttpResponseBadRequest(
                        f'Indicator {value.indicator}: {e}'
                    )
            return Response('OK')
        except KeyError:
            return HttpResponseBadRequest('`data` is required on payload')

    @swagger_auto_schema(
        operation_id='data-browser-delete',
        tags=[ApiTag.DATA_BROWSER],
        manual_parameters=[],
        request_body=IndicatorValueSerializer.
        Meta.delete_body,
    )
    def delete(self, request):
        """
        Batch delete data.

        This method deletes multiple `IndicatorValue` objects based on
            the provided IDs. It checks if the user has the necessary
            permissions to delete each object before performing the deletion.

        :param request: The HTTP request object containing the data. 
            The `ids` field in the request data should contain
            a list of IDs to delete.
        :type request: rest_framework.request.Request
        :return: An HTTP response with a 204 No Content status on
            successful deletion.
        :rtype: rest_framework.response.Response
        :raises TypeError: If the `ids` field in the request data is
            not properly formatted.
        """
        try:
            ids = json.loads(request.data['ids'])
        except TypeError:
            ids = request.data
        for value in IndicatorValue.objects.filter(id__in=ids):
            if value.permissions(request.user)['delete']:
                value.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(auto_schema=None)
    def retrieve(self, request, pk=None):
        """
        Retrieve detailed information of a code list.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :param pk: The primary key of the code list to retrieve,
            defaults to None.
        :type pk: int or None
        :return: The detailed information of the code list.
        :rtype: Response
        """
        return super().retrieve(request, pk=pk)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def ids(self, request):
        """
        Retrieve IDs of data.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :return: A response containing the IDs of the data.
        :rtype: HttpResponse
        """
        return super().ids(request)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def values_string(self, request):
        """
        Get a list of string values of data.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :return: A list of string values.
        :rtype: list
        """
        return super().values_string(request)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def values(self, request):
        """
        Retrieve values of data.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :return: The values of the data.
        :rtype: Any
        """
        return super().values(request)

    @swagger_auto_schema(auto_schema=None)
    @action(detail=False, methods=['get'])
    def statistic(self, request):
        """
        Get statistics of data.

        This method retrieves statistical information about the data,
        including the minimum, maximum, and average values.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :return: A dictionary containing the statistical data
            with keys 'min', 'max', and 'avg'.
        :rtype: dict
        """
        return super().statistic(request)
