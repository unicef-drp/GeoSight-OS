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

import datetime

import factory

from geosight.data.models.indicator import IndicatorValue, IndicatorExtraValue
from geosight.data.tests.model_factories.indicator.indicator import IndicatorF


class IndicatorValueF(factory.django.DjangoModelFactory):
    """Factory of IndicatorValue."""

    geom_id = factory.Sequence(lambda n: 'Geom {}'.format(n))
    value = factory.Sequence(lambda n: n)
    date = datetime.datetime.now()
    indicator = factory.SubFactory(IndicatorF)

    class Meta:  # noqa: D106
        model = IndicatorValue


class IndicatorExtraValueF(factory.django.DjangoModelFactory):
    """Factory of IndicatorExtraValue."""

    indicator_value = factory.SubFactory(IndicatorValueF)
    name = factory.Sequence(lambda n: 'Indicator Extra {}'.format(n))
    value = factory.Sequence(lambda n: n)

    class Meta:  # noqa: D106
        model = IndicatorExtraValue
