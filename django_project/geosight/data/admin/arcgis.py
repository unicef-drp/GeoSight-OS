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
__date__ = '20/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin

from geosight.data.forms.arcgis import ArcgisConfigForm
from geosight.data.models.arcgis import ArcgisConfig


@admin.action(description='Generate token')
def generate_token(modeladmin, request, queryset):
    """Generate token of arcgis."""
    for config in queryset:
        config.generate_token()


class ArcgisConfigAdmin(admin.ModelAdmin):
    """SharepointConfig admin."""

    form = ArcgisConfigForm
    list_display = ('name', 'generate_token_url', 'username')
    readonly_fields = ('token', 'token_val', 'expires', 'message')
    actions = (generate_token,)


admin.site.register(ArcgisConfig, ArcgisConfigAdmin)
