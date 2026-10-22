# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'andrewleblanc187@gmail.com'
__date__ = '22/10/2026'
__copyright__ = ('Copyright 2026, Unicef')

from django.contrib import admin

from geosight.h3grid.models import H3ReferenceLayer, H3ReferenceLayerConfig


class H3ReferenceLayerConfigInline(admin.StackedInline):
    """H3ReferenceLayerConfig inline."""

    model = H3ReferenceLayerConfig
    min_num = 1
    max_num = 1
    can_delete = False


@admin.register(H3ReferenceLayer)
class H3ReferenceLayerAdmin(admin.ModelAdmin):
    """H3ReferenceLayer admin."""

    inlines = (H3ReferenceLayerConfigInline,)
    list_display = ('name', 'identifier', 'description')
    search_fields = ('name', 'identifier')
    ordering = ('name',)
    fields = ('name', 'description', 'identifier')
    readonly_fields = ('identifier',)

    def get_form(self, request, obj=None, **kwargs):
        """Require a name so save() never falls back to GeoRepo."""
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['name'].required = True
        return form

    def save_model(self, request, obj, form, change):
        """Generate an identifier for new H3 layers."""
        if not obj.identifier:
            obj.identifier = H3ReferenceLayer.get_uuid()
        super().save_model(request, obj, form, change)
