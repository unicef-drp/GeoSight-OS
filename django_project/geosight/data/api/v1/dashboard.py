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
__date__ = '08/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.api_utils import common_api_params, ApiTag, ApiParams
from geosight.data.models.dashboard import Dashboard
from geosight.data.serializer.dashboard import DashboardBasicSerializer
from geosight.data.services.dashboard_service import (
    create_dashboard_from_payload,
    dashboard_config,
    update_dashboard_from_payload,
    DashboardConflictError,
    DashboardPayloadError,
    DashboardSharePermissionError,
)
from geosight.permission.access import (
    ResourcePermissionDenied,
    edit_permission_resource,
    read_permission_resource,
)
from .base import (
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDeleteOnly
)


DETAIL_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'detail': openapi.Schema(type=openapi.TYPE_STRING)
    }
)
ERROR_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'detail': openapi.Schema(
            type=openapi.TYPE_STRING,
            description='All problems in one line.'
        ),
        'errors': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            description='One entry per problem, with the field path.',
            items=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'field': openapi.Schema(
                        type=openapi.TYPE_STRING,
                        example='data.indicator_layers[0].indicators[0].id'
                    ),
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        )
    }
)
DATA_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    description=(
        'Layers, widgets, filters and tools. Required on create: '
        'reference_layer (identifier) and extent [min lon, min lat, '
        'max lon, max lat]. Lists (indicators, indicator_layers, '
        'context_layers, basemaps_layers, related_tables, widgets, tools) '
        'default to empty and structures to a flat list. Every id must '
        'exist. Use GET /api/v1/dashboards/{slug}/config of an existing '
        'dashboard as the reference for the full shape. For '
        'multipart/form-data, send this field as a JSON-encoded string.'
    ),
    properties={
        'reference_layer': openapi.Schema(type=openapi.TYPE_STRING),
        'extent': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_NUMBER)
        ),
        'level_config': openapi.Schema(type=openapi.TYPE_OBJECT),
        'indicators': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_OBJECT)
        ),
        'indicator_layers': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_OBJECT)
        ),
        'context_layers': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_OBJECT)
        ),
        'basemaps_layers': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_OBJECT)
        ),
        'widgets': openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(type=openapi.TYPE_OBJECT)
        ),
        'filters': openapi.Schema(type=openapi.TYPE_OBJECT),
        'permission': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            description=(
                'Optional sharing settings. On update it needs share '
                'permission; leave it out to keep the current sharing.'
            )
        ),
    }
)
SETTINGS_PROPERTIES = {
    'name': openapi.Schema(type=openapi.TYPE_STRING),
    'slug': openapi.Schema(type=openapi.TYPE_STRING),
    'description': openapi.Schema(type=openapi.TYPE_STRING),
    'overview': openapi.Schema(type=openapi.TYPE_STRING),
    'group': openapi.Schema(type=openapi.TYPE_STRING),
    'geoField': openapi.Schema(type=openapi.TYPE_STRING),
    'featured': openapi.Schema(
        type=openapi.TYPE_BOOLEAN, description='Admins only.'
    ),
    'show_splash_first_open': openapi.Schema(type=openapi.TYPE_BOOLEAN),
    'truncate_indicator_layer_name': openapi.Schema(
        type=openapi.TYPE_BOOLEAN
    ),
    'layer_tabs_visibility': openapi.Schema(type=openapi.TYPE_STRING),
    'default_time_mode': openapi.Schema(type=openapi.TYPE_OBJECT),
    'show_map_toolbar': openapi.Schema(type=openapi.TYPE_BOOLEAN),
    'transparency_config': openapi.Schema(type=openapi.TYPE_OBJECT),
    'data': DATA_SCHEMA,
}
CONFIG_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        **SETTINGS_PROPERTIES,
        'modified_at': openapi.Schema(
            type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME
        ),
    }
)


class DashboardViewSet(
    BaseApiV1ResourceReadOnly,
    BaseApiV1ResourceDeleteOnly
):
    """Dashboard view set."""

    model_class = Dashboard
    serializer_class = DashboardBasicSerializer
    extra_exclude_fields = ['parameters']
    lookup_field = 'slug'

    @swagger_auto_schema(
        operation_id='dashboard-create',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                **SETTINGS_PROPERTIES,
                'icon': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_BINARY
                )
            },
            required=['name', 'data']
        ),
        responses={
            201: openapi.Response(
                description='Created dashboard.',
                schema=DashboardBasicSerializer
            ),
            400: openapi.Response(
                description=(
                    'Validation error: { "detail", "errors" } with the field '
                    'path of every problem, or a form field error map.'
                ),
                schema=ERROR_SCHEMA
            ),
            403: openapi.Response(
                description='Forbidden for anonymous or non-creator users.',
                schema=DETAIL_SCHEMA
            )
        },
        operation_description=(
            'Create a dashboard. Supports application/json and '
            'multipart/form-data payloads. Requires authenticated creator '
            'role or higher. Settings may be sent at the top level or inside '
            'data, so the output of GET config can be sent as it is (with a '
            'new slug).'
        )
    )
    def create(self, request, *args, **kwargs):  # noqa: DOC101,DOC103
        """
        Create a dashboard using the shared dashboard creation flow.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :return: Created dashboard object or validation errors.
        :rtype: rest_framework.response.Response
        """
        request_data = request.data.copy()
        if hasattr(request_data, 'dict'):
            payload = request_data.dict()
        else:
            payload = dict(request_data)

        result = create_dashboard_from_payload(
            payload, request.user, request.FILES
        )
        if result.dashboard:
            serializer = self.get_serializer(result.dashboard)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        if result.form_errors:
            return Response(
                result.form_errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'detail': result.error, 'errors': result.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    @swagger_auto_schema(
        operation_id='dashboard-detail-config',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        responses={
            200: openapi.Response(
                description='Dashboard config.', schema=CONFIG_SCHEMA
            ),
            403: openapi.Response(
                description='No read permission.', schema=DETAIL_SCHEMA
            ),
            404: openapi.Response(description='Dashboard not found.')
        },
        operation_description=(
            'Return the full config of a dashboard in the shape that create '
            'and update accept: top-level settings, modified_at and data. '
            'Sharing is not included. Requires read permission.'
        )
    )
    @action(detail=True, methods=['get'], url_path='config')
    def config(self, request, slug=None):
        """
        Return the full config of a dashboard.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard.
        :type slug: str

        :return: The dashboard config.
        :rtype: rest_framework.response.Response
        """
        instance = get_object_or_404(Dashboard, slug=slug)
        read_permission_resource(instance, request.user)
        return Response(dashboard_config(instance))

    @swagger_auto_schema(
        operation_id='dashboard-detail-update',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                **SETTINGS_PROPERTIES,
                'modified_at': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_DATETIME,
                    description=(
                        'Optional. The modified_at from GET config; the '
                        'update is rejected with 409 if the dashboard was '
                        'saved after it.'
                    )
                ),
                'icon': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_BINARY
                )
            }
        ),
        responses={
            200: openapi.Response(
                description='The updated dashboard config.',
                schema=CONFIG_SCHEMA
            ),
            400: openapi.Response(
                description='Validation error.', schema=ERROR_SCHEMA
            ),
            403: openapi.Response(
                description=(
                    'No edit permission, or permission sent without share '
                    'permission.'
                ),
                schema=DETAIL_SCHEMA
            ),
            404: openapi.Response(description='Dashboard not found.'),
            409: openapi.Response(
                description='The dashboard changed since modified_at.',
                schema=DETAIL_SCHEMA
            ),
        },
        operation_description=(
            'Update a dashboard in place: its id, creator, creation date, '
            'sharing, bookmarks and embeds stay. Keys that are not sent keep '
            'their current value (top-level settings and every key of data). '
            'A list that is sent replaces the current list: items with their '
            'id from GET config are updated, other items are created and '
            'items left out are removed. permission is optional and needs '
            'share permission. Requires contributor role or higher and edit '
            'permission on the dashboard.'
        )
    )
    def update(self, request, slug=None, **kwargs):  # noqa: DOC103
        """
        Update a dashboard in place.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard.
        :type slug: str

        :param kwargs: Additional keyword arguments.
        :type kwargs: dict

        :return: The updated dashboard config or an error.
        :rtype: rest_framework.response.Response
        """
        instance = get_object_or_404(Dashboard, slug=slug)
        edit_permission_resource(instance, request.user)
        request_data = request.data.copy()
        if hasattr(request_data, 'dict'):
            payload = request_data.dict()
        else:
            payload = dict(request_data)
        try:
            dashboard = update_dashboard_from_payload(
                instance, payload, request.user, request.FILES
            )
        except DashboardPayloadError as e:
            return Response(
                {'detail': e.detail, 'errors': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except DashboardSharePermissionError as e:
            return Response(
                {'detail': str(e)}, status=status.HTTP_403_FORBIDDEN
            )
        except DashboardConflictError as e:
            return Response(
                {'detail': str(e)}, status=status.HTTP_409_CONFLICT
            )
        dashboard.refresh_from_db()
        return Response(dashboard_config(dashboard))

    @swagger_auto_schema(
        operation_id='dashboard-list',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[
            *common_api_params,
            ApiParams.NAME_CONTAINS,
            ApiParams.DESCRIPTION_CONTAINS,
            ApiParams.CATEGORIES
        ],
        operation_description='Return list of accessed dashboard for the user.'
    )
    def list(self, request, *args, **kwargs):  # noqa: DOC103
        """
        Return list of accessible dashboards for the authenticated user.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param args: Additional positional arguments.
        :type args: tuple

        :param kwargs: Additional keyword arguments.
        :type kwargs: dict

        :return: Paginated list of dashboard objects.
        :rtype: rest_framework.response.Response
        """
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_id='dashboard-group-list',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='List dashboard groups.'
    )
    @action(detail=False, methods=['get'])
    def groups(self, request):
        """
        Return list of dashboard groups accessible to the user.

        Retrieves distinct group names from all dashboards that the
        authenticated user has access to.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :return: List of unique dashboard group names.
        :rtype: rest_framework.response.Response
        """
        querysets = self.get_queryset()
        groups = querysets.values_list(
            'group__name', flat=True
        ).distinct().order_by('group__name')
        return Response(groups)

    @swagger_auto_schema(
        operation_id='dashboard-detail',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Return detailed of dashboard.'
    )
    def retrieve(self, request, slug=None):
        """
        Return detailed information for a specific dashboard.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard.
        :type slug: str

        :return: Detailed dashboard object.
        :rtype: rest_framework.response.Response
        """
        return super().retrieve(request, slug=slug)

    @swagger_auto_schema(
        operation_id='dashboard-detail-delete',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Delete a dashboard.'
    )
    def destroy(self, request, slug=None):
        """
        Delete a dashboard by its slug.

        :param request: The HTTP request object.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard to delete.
        :type slug: str

        :return: Empty response with 204 status code on success.
        :rtype: rest_framework.response.Response
        """
        return super().destroy(request, slug=slug)

    @swagger_auto_schema(
        operation_id='dashboard-detail-as-feature',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Feature a dashboard.'
    )
    @action(detail=True, methods=['post'], url_path='as-feature')
    def as_feature(self, request, slug=None):  # noqa: DOC503
        """
        Mark a dashboard as featured.

        Sets the featured flag to True for the specified dashboard.
        Only administrators are permitted to perform this action.

        :param request: The HTTP request object containing user information.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard to feature.
        :type slug: str

        :return: Empty response with 204 status code on success.
        :rtype: rest_framework.response.Response

        :raises ResourcePermissionDenied: If user is not an administrator.
        :raises Http404: If dashboard with given slug does not exist.
        """
        try:
            if not request.user.profile.is_admin:
                raise ResourcePermissionDenied
        except AttributeError:
            raise ResourcePermissionDenied
        instance = self.get_object()
        instance.featured = True
        instance.modified_by = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_id='dashboard-detail-remove-as-feature',
        tags=[ApiTag.DASHBOARD],
        manual_parameters=[],
        operation_description='Remove feature a dashboard.'
    )
    @action(detail=True, methods=['post'], url_path='remove-as-feature')
    def remove_as_feature(self, request, slug=None):  # noqa: DOC503
        """
        Remove featured status from a dashboard.

        Sets the featured flag to False for the specified dashboard.
        Only administrators are permitted to perform this action.

        :param request: The HTTP request object containing user information.
        :type request: rest_framework.request.Request

        :param slug: The unique slug identifier of the dashboard to unfeature.
        :type slug: str

        :return: Empty response with 204 status code on success.
        :rtype: rest_framework.response.Response

        :raises ResourcePermissionDenied: If user is not an administrator.
        :raises Http404: If dashboard with given slug does not exist.
        """
        try:
            if not request.user.profile.is_admin:
                raise ResourcePermissionDenied
        except AttributeError:
            raise ResourcePermissionDenied
        instance = self.get_object()
        instance.featured = False
        instance.modified_by = request.user
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
