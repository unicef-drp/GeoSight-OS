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

from geosight.data.models.indicator.indicator_value import (
    IndicatorValueWithGeo
)
from geosight.georepo.models import (
    ReferenceLayerView, ReferenceLayerViewEntity
)
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


@admin.action(description='Sync entities')
def sync_codes(modeladmin, request, queryset):
    """Fetch new reference layer."""
    fetch_reference_codes_by_ids.delay(
        list(queryset.values_list('id', flat=True))
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


class ReferenceLayerViewAdmin(admin.ModelAdmin):
    """ReferenceLayerView admin."""

    list_display = [
        'identifier', 'name', 'description', 'in_georepo', 'number_of_value',
        'number_of_entities'
    ]
    list_filter = (InGeorepoFilter,)
    ordering = ['name']
    actions = [
        update_meta, sync_codes, action_fetch_datasets,
        action_create_data_access, invalidate_cache
    ]

    def in_georepo(self, obj: ReferenceLayerView):
        """Is reference layer in georepo."""
        if obj.in_georepo:
            return '✓'
        return '✕'

    def number_of_value(self, obj: ReferenceLayerView):
        """Return number of value for this reference layer."""
        return IndicatorValueWithGeo.objects.filter(
            reference_layer_id=obj.id
        ).count()

    def number_of_entities(self, obj: ReferenceLayerView):
        """Return number of value for this reference layer."""
        return ReferenceLayerViewEntity.objects.filter(
            reference_layer=obj
        ).count()


admin.site.register(ReferenceLayerView, ReferenceLayerViewAdmin)
