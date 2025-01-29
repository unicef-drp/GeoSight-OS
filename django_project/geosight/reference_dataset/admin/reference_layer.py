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

from django.contrib import admin

from geosight.georepo.admin.reference_layer import ReferenceLayerViewAdmin
from geosight.reference_dataset.models import (
    ReferenceDataset, ReferenceDatasetLevel
)


class ReferenceDatasetLevelInline(admin.TabularInline):
    """ReferenceDatasetLevel inline."""

    model = ReferenceDatasetLevel
    extra = 0


@admin.register(ReferenceDataset)
class ReferenceDatasetAdmin(ReferenceLayerViewAdmin):
    """ReferenceDataset admin."""

    inlines = (ReferenceDatasetLevelInline,)
    search_fields = ('name',)
