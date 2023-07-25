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

import factory

from geosight.data.models.indicator import IndicatorRule
from geosight.data.tests.model_factories.indicator import IndicatorF


class IndicatorRuleF(factory.django.DjangoModelFactory):
    """Factory of IndicatorRule."""

    name = factory.Sequence(lambda n: 'Rule {}'.format(n))
    indicator = factory.SubFactory(IndicatorF)
    color = factory.Sequence(lambda n: '#{}'.format(n))

    class Meta:  # noqa: D106
        model = IndicatorRule
