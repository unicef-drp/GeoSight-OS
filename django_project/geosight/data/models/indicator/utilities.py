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
__date__ = '04/03/2025'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

import pytz
from django.conf import settings

from geosight.data.models.indicator import Indicator
from geosight.data.models.indicator.indicator_value import IndicatorValue
from geosight.georepo.models.reference_layer import ReferenceLayerView


def metadata_indicator_by_view(
        indicator: Indicator, reference_layer: ReferenceLayerView,
        is_using_uuid=False
):
    """Metadata indicator by view.

    Return dates and count.
    """
    if is_using_uuid:
        query = IndicatorValue.objects.filter(
            country__concept_uuid__in=reference_layer.countries.values_list(
                'concept_uuid', flat=True
            ),
            indicator=indicator,
        )
    else:
        query = IndicatorValue.objects.filter(
            country__in=reference_layer.countries.all(),
            indicator=indicator,
        )
    dates = [
        datetime.combine(
            date_str, datetime.min.time(),
            tzinfo=pytz.timezone(settings.TIME_ZONE)
        ).isoformat()
        for date_str in set(
            query.values_list('date', flat=True)
        )
    ]
    dates.sort()

    return {
        'dates': dates,
        'count': query.count()
    }
