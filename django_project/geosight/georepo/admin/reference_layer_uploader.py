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
__date__ = '12/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin

from geosight.georepo.models import (
    ReferenceLayerViewUploader, ReferenceLayerViewUploaderLevel
)


class ReferenceLayerViewUploaderLevelInline(admin.TabularInline):
    """ReferenceLayerViewUploaderLevel inline."""

    model = ReferenceLayerViewUploaderLevel
    extra = 0


class ReferenceLayerViewUploaderAdmin(admin.ModelAdmin):
    """ReferenceLayerViewUploader admin."""

    list_display = [
        'name', 'created_at', 'creator'
    ]
    inlines = (ReferenceLayerViewUploaderLevelInline,)


admin.site.register(
    ReferenceLayerViewUploader, ReferenceLayerViewUploaderAdmin
)
