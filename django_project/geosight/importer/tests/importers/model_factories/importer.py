# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '17/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import factory

from geosight.importer.models.importer import (
    Importer, ImportType, InputFormat
)
from geosight.importer.models.attribute import ImporterAttribute


class ImporterFactory(factory.django.DjangoModelFactory):
    """Factory for Importer."""

    import_type = ImportType.INDICATOR_VALUE
    input_format = InputFormat.EXCEL_LONG

    class Meta:  # noqa: D106
        model = Importer


class ImporterAttributesFactory(factory.django.DjangoModelFactory):
    """Factory for Importer Attributes."""

    importer = factory.SubFactory(ImporterFactory)
    name = factory.Sequence(lambda n: 'Importer Attribute {}'.format(n))

    class Meta:  # noqa: D106
        model = ImporterAttribute
