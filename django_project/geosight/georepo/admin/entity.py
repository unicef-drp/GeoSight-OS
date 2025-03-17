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
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from geosight.georepo.models.entity import Entity, EntityCode


class NullCountryFilter(admin.SimpleListFilter):
    """Null entity filter."""

    title = _('Country Null')
    parameter_name = 'is_country_null'

    def lookups(self, request, model_admin):
        """Lookup function for entity filter."""
        return [
            ('yes', _('Is NULL')),
            ('no', _('Is NOT NULL')),
        ]

    def queryset(self, request, queryset):
        """Return filtered queryset."""
        if self.value() == 'yes':
            return queryset.filter(country__isnull=True)
        if self.value() == 'no':
            return queryset.filter(country__isnull=False)
        return queryset


@admin.action(description='Assign country')
def assign_country(modeladmin, request, queryset):
    """Assign country."""
    Entity.assign_country()


class EntityCodeInline(admin.TabularInline):
    """EntityCode inline."""

    model = EntityCode
    extra = 0


class EntityAdmin(admin.ModelAdmin):
    """Entity admin."""

    list_display = [
        'pk', 'name', 'admin_level', 'concept_uuid',
        'geom_id', 'parents', 'country_name'
    ]
    ordering = ['admin_level', 'geom_id']
    list_filter = [NullCountryFilter, 'admin_level']
    search_fields = ['geom_id', 'concept_uuid']
    inlines = (EntityCodeInline,)
    actions = [assign_country]
    readonly_fields = ('reference_layer',)
    raw_id_fields = ('country',)

    def country_name(self, obj: Entity):
        """Return country name."""
        if not obj.country_id:
            return '-'
        url = f"/django-admin/geosight_georepo/entity/{obj.country_id}/change/"
        return format_html(
            f'<a href="{url}" target="_blank">{obj.country.name}</a>'
        )


admin.site.register(Entity, EntityAdmin)
