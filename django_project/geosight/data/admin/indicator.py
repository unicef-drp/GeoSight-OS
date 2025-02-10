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
from django.db import connection
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from geosight.data.admin.base import BaseAdminResourceMixin
from geosight.data.models.indicator import (
    Indicator, IndicatorGroup,
    IndicatorValue, IndicatorRule, IndicatorExtraValue,
    IndicatorValueWithGeo
)


class NullEntityFilter(admin.SimpleListFilter):
    """Null entity filter."""

    title = _('Entity Null')
    parameter_name = 'is_entity_null'

    def lookups(self, request, model_admin):
        """Lookup function for entity filter."""
        return [
            ('yes', _('Is NULL')),
            ('no', _('Is NOT NULL')),
        ]

    def queryset(self, request, queryset):
        """Return filtered queryset."""
        if self.value() == 'yes':
            return queryset.filter(entity__isnull=True)
        if self.value() == 'no':
            return queryset.filter(entity__isnull=False)
        return queryset


@admin.action(description='Assign entity')
def assign_entity(modeladmin, request, queryset):
    """Assign entity."""
    sql = """
        UPDATE geosight_data_indicatorvalue AS value
        SET entity_id = entity.id
        FROM geosight_georepo_entity AS entity
        WHERE value.geom_id = entity.geom_id AND value.entity_id IS NULL;
    """
    with connection.cursor() as cursor:
        cursor.execute(sql)


class IndicatorExtraValueRuleInline(admin.TabularInline):
    """IndicatorExtraValue inline."""

    model = IndicatorExtraValue
    extra = 0


class IndicatorValueAdmin(admin.ModelAdmin):
    """IndicatorValue admin."""

    list_display = ('indicator', 'date', 'value', 'geom_id', 'entity')
    list_filter = (NullEntityFilter, 'date', 'indicator')
    search_fields = ('indicator__name', 'geom_id')
    inlines = (IndicatorExtraValueRuleInline,)
    actions = (assign_entity,)


class IndicatorRuleInline(admin.TabularInline):
    """IndicatorRule inline."""

    model = IndicatorRule
    extra = 0


@admin.action(description='Invalidate cache')
def invalidate_cache(modeladmin, request, queryset):
    """Invalidate cache of value on frontend."""
    queryset.update(version_data=timezone.now())


class IndicatorAdmin(BaseAdminResourceMixin):
    """Indicator admin."""

    list_display = (
        'name', 'group', 'type'
    ) + BaseAdminResourceMixin.list_display
    list_filter = ('group',)
    list_editable = ('creator', 'group', 'type')
    search_fields = ('name',)
    inlines = (IndicatorRuleInline,)
    actions = (invalidate_cache,)


class IndicatorGroupAdmin(admin.ModelAdmin):
    """IndicatorGroup admin."""

    list_display = ('name',)


@admin.register(IndicatorValueWithGeo)
class IndicatorValueWithGeoAdmin(admin.ModelAdmin):
    """Admin for checking indicator values with geometry."""

    list_display = (
        'reference_layer_name', 'reference_layer_uuid', 'indicator_name',
        'date', 'value'
    )

    def has_add_permission(self, request):
        """Return True if the user has add permission."""
        return False

    def has_change_permission(self, request, obj=None):
        """Return True if the user has change permission."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Return True if the user has delete permission."""
        return False


admin.site.register(IndicatorGroup, IndicatorGroupAdmin)
admin.site.register(IndicatorValue, IndicatorValueAdmin)
admin.site.register(Indicator, IndicatorAdmin)
