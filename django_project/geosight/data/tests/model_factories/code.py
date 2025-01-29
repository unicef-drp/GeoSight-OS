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
__date__ = '29/01/2025'
__copyright__ = ('Copyright 2025, Unicef')

import factory
from geosight.data.models.code import (
    Code, CodeList, CodeInCodeList
)


class CodeF(factory.django.DjangoModelFactory):
    """Factory for Code."""

    name = factory.Sequence(lambda n: 'Code {}'.format(n))
    description = factory.Sequence(lambda n: 'Code Description {}'.format(n))
    value = factory.Sequence(lambda n: 'Code Value {}'.format(n))

    class Meta:  # noqa: D106
        model = Code


class CodeListF(factory.django.DjangoModelFactory):
    """Factory for Code List."""

    name = factory.Sequence(lambda n: 'Code List {}'.format(n))
    description = factory.Sequence(lambda n: 'Code List Description {}'.format(n))

    class Meta:  # noqa: D106
        model = CodeList


class CodeInCodeListF(factory.django.DjangoModelFactory):
    """Factory for Code In Code List."""

    codelist = factory.SubFactory(CodeListF)
    code = factory.SubFactory(CodeF)

    class Meta:  # noqa: D106
        model = CodeInCodeList
