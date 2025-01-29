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
__date__ = '25/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

from drf_yasg import openapi

common_api_params = [
    openapi.Parameter(
        'page',
        openapi.IN_QUERY,
        description='Page number in pagination',
        type=openapi.TYPE_INTEGER,
        default=1
    ),
    openapi.Parameter(
        'page_size',
        openapi.IN_QUERY,
        description='Total records in a page',
        type=openapi.TYPE_INTEGER,
        default=25
    ),
    openapi.Parameter(
        'sort',
        openapi.IN_QUERY,
        description=(
            'Fields to be sorted '
            'should be specified as a comma-separated list.'
            'e.g: sort=name for asc, -sort=name for desc'
        ),
        type=openapi.TYPE_STRING,
        required=False,
    ),
    openapi.Parameter(
        'fields',
        openapi.IN_QUERY,
        description=(
            'Fields to be returned '
            'should be specified as a comma-separated list.'
            'e.g: fields=__all__ for returning all fields, '
            'fields=name,category to return just name and category'
        ),
        type=openapi.TYPE_STRING,
        required=False,
    )
]


class ApiTag:
    """Return API Tags."""

    DASHBOARD = 'Dashboard'
    BASEMAP = 'Basemap'
    INDICATOR = 'Indicator'
    CONTEXT_LAYER = 'Context layer'
    RELATED_TABLE = 'Related table'
    RELATED_TABLE_DATA = 'Related table data'
    DATA_BROWSER = 'Data Browser'
    STYLE = 'Style'
    GROUP = 'Group'
    USER = 'USER'


class ApiParams:
    """Return API Parameters."""

    NAME_CONTAINS = openapi.Parameter(
        'name__contains',
        openapi.IN_QUERY,
        description='Filter data by partial name.',
        type=openapi.TYPE_STRING
    )

    DESCRIPTION_CONTAINS = openapi.Parameter(
        'description__contains',
        openapi.IN_QUERY,
        description='Filter data by partial description.',
        type=openapi.TYPE_STRING
    )

    CATEGORIES = openapi.Parameter(
        'category__name__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple category. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    TYPES = openapi.Parameter(
        'type__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple type. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    PROJECT_IDS = openapi.Parameter(
        'project_id__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple project id. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    PROJECT_SLUGS = openapi.Parameter(
        'project_slug__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple project slug. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    INDICATOR_ID = openapi.Parameter(
        'indicator_id__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple indicator id. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    INDICATOR_SHORTCODE = openapi.Parameter(
        'indicator_shortcode__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple indicator shortcode. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    DATASET_UUID = openapi.Parameter(
        'dataset_uuid__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple reference dataset view uuid. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    ADMIN_LEVEL = openapi.Parameter(
        'admin_level__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple admin level in number. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    GEOM_ID = openapi.Parameter(
        'geom_id__in',
        openapi.IN_QUERY,
        description=(
            'Filter data by multiple geom id. '
            'Put multiple filter using comma separator.'
        ),
        type=openapi.TYPE_STRING
    )

    DATE_FROM = openapi.Parameter(
        'date__gte',
        openapi.IN_QUERY,
        description=(
            'Filter data from the date in format YYYY-MM-DD.'
        ),
        type=openapi.TYPE_STRING
    )

    DATE_TO = openapi.Parameter(
        'date__lte',
        openapi.IN_QUERY,
        description=(
            'Filter data up to the date in format YYYY-MM-DD.'
        ),
        type=openapi.TYPE_STRING
    )
