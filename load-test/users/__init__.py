# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '21/02/2026'
__copyright__ = ('Copyright 2026, Unicef')


from .full_journey import FullJourneyUser
from .single_endpoint import (
    DashboardDataUser,
    DashboardBookmarksUser,
    IndicatorMetadataUser,
    RelatedTableDatesUser,
    IndicatorDataUser,
    IndicatorsBulkDataUser,
    IndicatorStatisticUser,
    IndicatorValuesUser,
    IndicatorLayerUser,
    ReferenceDatasetsUser,
    RelatedTableDetailUser,
    RelatedTableDataUser,
)


"""User classes for GeoSight load tests."""
__all__ = [
    "FullJourneyUser",
    "DashboardDataUser",
    "DashboardBookmarksUser",
    "IndicatorMetadataUser",
    "RelatedTableDatesUser",
    "IndicatorDataUser",
    "IndicatorsBulkDataUser",
    "IndicatorStatisticUser",
    "IndicatorValuesUser",
    "IndicatorLayerUser",
    "ReferenceDatasetsUser",
    "RelatedTableDetailUser",
    "RelatedTableDataUser",
]
