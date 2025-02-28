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
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from geosight.georepo.models import ReferenceLayerView
from geosight.georepo.tasks import (
    fetch_reference_codes_by_ids, fetch_datasets, create_data_access
)


class InGeorepoFilter(admin.SimpleListFilter):
    """Null entity filter."""

    title = _('in georepo')
    parameter_name = 'in_georepo'

    def lookups(self, request, model_admin):
        """Lookup function for entity filter."""
        return [
            ('yes', _('Yes')),
            ('no', _('No')),
        ]

    def queryset(self, request, queryset):
        """Return filtered queryset."""
        if self.value() == 'yes':
            return queryset.filter(in_georepo=True)
        if self.value() == 'no':
            return queryset.filter(in_georepo=False)
        return queryset


@admin.action(description='Update meta')
def update_meta(modeladmin, request, queryset):
    """Fetch new reference layer."""
    for reference_layer in queryset:
        reference_layer.update_meta()


@admin.action(description='Sync entities on all level')
def sync_codes(modeladmin, request, queryset):
    """Fetch new reference layer."""
    fetch_reference_codes_by_ids.delay(
        list(queryset.values_list('id', flat=True)),
        sync_all=True
    )


@admin.action(description='Sync entities on non saved level')
def sync_codes_non_saved_level(modeladmin, request, queryset):
    """Fetch new reference layer."""
    fetch_reference_codes_by_ids.delay(
        list(queryset.values_list('id', flat=True)),
        sync_all=False
    )


@admin.action(description='Fetch new views')
def action_fetch_datasets(modeladmin, request, queryset):
    """Fetch new reference layer."""
    fetch_datasets.delay(True)


@admin.action(description='Create all data access')
def action_create_data_access(modeladmin, request, queryset):
    """Fetch new reference layer."""
    create_data_access.delay()


@admin.action(description='Invalidate cache')
def invalidate_cache(modeladmin, request, queryset):
    """Invalidate cache of value on frontend."""
    queryset.update(version_data=timezone.now())


@admin.action(description='Assign countries')
def assign_countries(modeladmin, request, queryset):
    """Assign countries."""
    for reference_layer in queryset:
        reference_layer.assign_countries()


class ReferenceLayerViewAdmin(admin.ModelAdmin):
    """ReferenceLayerView admin."""

    list_display = [
        'identifier', 'name', 'description', 'in_georepo', 'number_of_value',
        'number_of_entities', 'country_list'
    ]
    list_filter = (InGeorepoFilter,)
    ordering = ['name']
    actions = [
        update_meta, sync_codes, sync_codes_non_saved_level,
        action_fetch_datasets, action_create_data_access, invalidate_cache,
        assign_countries
    ]

    def in_georepo(self, obj: ReferenceLayerView):
        """Is reference layer in georepo."""
        if obj.in_georepo:
            return '✓'
        return '✕'

    def number_of_value(self, obj: ReferenceLayerView):
        """Return number of value for this reference layer."""
        # TODO:
        #  We need to fix this with using IndicatorValue
        return 0

    def number_of_entities(self, obj: ReferenceLayerView):
        """Return number of value for this reference layer."""
        return obj.entities_set.count()

    def country_list(self, obj: ReferenceLayerView):
        """Return countries of view."""
        return list(obj.countries.values_list('name', flat=True))


admin.site.register(ReferenceLayerView, ReferenceLayerViewAdmin)
