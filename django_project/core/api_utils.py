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
    )
]


class ApiTag:
    """Return API Tags."""

    DATASET = 'Data Browser'


class ApiParams:
    """Return API Parameters."""

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
