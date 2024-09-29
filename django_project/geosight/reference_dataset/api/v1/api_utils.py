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
__date__ = '25/09/2023'
__copyright__ = ('Copyright 2023, Unicef')

from drf_yasg import openapi


class ApiTag:
    """Return API Tags."""

    REFERENCE_DATASET = 'Reference datasets'


class ApiParams:
    """Return API Parameters."""

    IDENTIFIER = openapi.Parameter(
        'identifier__in',
        openapi.IN_QUERY,
        description='Filter data by identifier.',
        type=openapi.TYPE_STRING
    )

    CONCEPT_UUID = openapi.Parameter(
        'concept_uuid__in',
        openapi.IN_QUERY,
        description='Filter data by concept_uuid.',
        type=openapi.TYPE_STRING
    )
