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

from geosight.data.admin.base import invalidate_cache
from geosight.georepo.models import ReferenceLayerView
from geosight.georepo.tasks import (
    fetch_reference_codes_by_ids, fetch_datasets, create_data_access
)


class InGeorepoFilter(admin.SimpleListFilter):
    """Null entity filter."""

    title = _('in georepo')
    parameter_name = 'in_georepo'

    def lookups(self, request, model_admin):
        """
        Provide lookup choices for the filter dropdown.

        Returns a list of tuples representing filter options:
        - ('yes', 'Yes') to filter where is in GeoRepo.
        - ('no', 'No') to filter where is not in GeoRepo (local).

        :param request: The current HttpRequest object.
        :type request: django.http.HttpRequest
        :param model_admin: The current ModelAdmin instance.
        :type model_admin: django.contrib.admin.ModelAdmin
        :return: List of tuples representing filter options.
        :rtype: list[tuple[str, str]]
        """
        return [
            ('yes', _('Yes')),
            ('no', _('No')),
        ]

    def queryset(self, request, queryset):
        """
        Filter the queryset based on the value of this filter.

        :param request: The current HttpRequest object.
        :type request: django.http.HttpRequest

        :param queryset: The original queryset to filter.
        :type queryset: django.db.models.QuerySet

        :return: The filtered or original queryset depending on filter value.
        :rtype: django.db.models.QuerySet
        """
        if self.value() == 'yes':
            return queryset.filter(in_georepo=True)
        if self.value() == 'no':
            return queryset.filter(in_georepo=False)
        return queryset


@admin.action(description='Update meta')
def update_meta(modeladmin, request, queryset):
    """
    Update metadata for selected reference layers.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HttpRequest object.
    :type request: django.http.HttpRequest
    :param queryset: The queryset of selected ReferenceLayerView instances.
    :type queryset: django.db.models.QuerySet
    """
    for reference_layer in queryset:
        reference_layer.update_meta()


@admin.action(description='Sync entities on all level')
def sync_codes(modeladmin, request, queryset):
    """
    Trigger asynchronous task to sync entities for all levels.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HttpRequest object.
    :type request: django.http.HttpRequest
    :param queryset:
        The queryset of selected ReferenceDatasetImporterLevel instances.
    :type queryset: django.db.models.QuerySet
    """
    fetch_reference_codes_by_ids.delay(
        list(queryset.values_list('id', flat=True)),
        sync_all=True
    )


@admin.action(description='Sync entities on non saved level')
def sync_codes_non_saved_level(modeladmin, request, queryset):
    """
    Trigger asynchronous task to sync entities for levels that are not saved.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HttpRequest object.
    :type request: django.http.HttpRequest
    :param queryset:
        The queryset of selected ReferenceDatasetImporterLevel instances.
    :type queryset: django.db.models.QuerySet
    """
    fetch_reference_codes_by_ids.delay(
        list(queryset.values_list('id', flat=True)),
        sync_all=False
    )


@admin.action(description='Fetch new views')
def action_fetch_datasets(modeladmin, request, queryset):
    """
    Trigger asynchronous task to fetch new reference layer datasets.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HttpRequest object.
    :type request: django.http.HttpRequest
    :param queryset: The queryset of selected model instances (not used).
    :type queryset: django.db.models.QuerySet
    """
    fetch_datasets.delay(True)


@admin.action(description='Create all data access')
def action_create_data_access(modeladmin, request, queryset):
    """
    Trigger asynchronous task to create all data access entries.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HttpRequest object.
    :type request: django.http.HttpRequest
    :param queryset: The queryset of selected model instances (not used).
    :type queryset: django.db.models.QuerySet
    """
    create_data_access.delay()


@admin.action(description='Assign countries')
def assign_countries(modeladmin, request, queryset):
    """
    Admin action to assign countries to selected reference layers.

    :param modeladmin: The current ModelAdmin instance.
    :type modeladmin: django.contrib.admin.ModelAdmin

    :param request: The current HttpRequest object.
    :type request: django.http.HttpRequest

    :param queryset: The queryset of selected reference layer instances.
    :type queryset: django.db.models.QuerySet
    """
    for reference_layer in queryset:
        reference_layer.assign_countries()


class ReferenceLayerViewAdmin(admin.ModelAdmin):
    """ReferenceLayerView admin."""

    list_display = [
        'identifier', 'name', 'description', 'in_georepo', 'number_of_value',
        'number_of_entities', 'country_list', 'tags'
    ]
    list_filter = (InGeorepoFilter,)
    search_fields = ['name', 'identifier']
    ordering = ['name']
    actions = [
        update_meta, sync_codes, sync_codes_non_saved_level,
        action_fetch_datasets, action_create_data_access, invalidate_cache,
        assign_countries
    ]
    filter_horizontal = ['countries']

    def get_readonly_fields(self, request, obj=None):
        """
        Set read-only fields whether the object is being created or edited.

        :param request: The current HttpRequest object.
        :type request: HttpRequest
        :param obj:
            The instance of the model being edited. None if creating a new one.
        :type obj: ReferenceDataset or None
        :return: A tuple of field names that should be read-only.
        :rtype: tuple
        """
        if obj:
            return ('countries',)
        return ()

    def in_georepo(self, obj: ReferenceLayerView):
        """
        Indicate whether the reference layer is present in GeoRepo.

        Returns a check mark if `in_georepo` is True, otherwise a cross.

        :param obj: An instance of `ReferenceLayerView`.
        :type obj: ReferenceLayerView
        :return: '✓' if in GeoRepo, otherwise '✕'.
        :rtype: str
        """
        if obj.in_georepo:
            return '✓'
        return '✕'

    def number_of_value(self, obj: ReferenceLayerView):
        """
        Return the number of values for this reference layer.

        .. todo::
            Implement this method properly by using `IndicatorValue`.

        :param obj: An instance of `ReferenceLayerView`.
        :type obj: ReferenceLayerView
        :return: Currently returns 0 as a placeholder.
        :rtype: int
        """
        return 0

    def number_of_entities(self, obj: ReferenceLayerView):
        """
        Return the count of entities with the given ReferenceLayerView.

        :param obj: An instance of `ReferenceLayerView`.
        :type obj: ReferenceLayerView
        :return: The number of related entities.
        :rtype: int
        """
        return obj.entities_set.count()

    def country_list(self, obj: ReferenceLayerView):
        """
        Return an HTML list of countries related to the ReferenceLayerView.

        Iterates over the `countries` related to the `obj`, creating
        admin change URLs for each country and joining them as clickable links.

        :param obj: An instance of `ReferenceLayerView`.
        :type obj: ReferenceLayerView
        :return:
            An HTML-safe string containing
            comma-separated links to country admin pages.
        :rtype: django.utils.safestring.SafeString
        """
        _list = []
        for country in obj.countries.all():
            url = f"/django-admin/geosight_georepo/entity/{country.id}/change/"
            _list.append(
                f'<a href="{url}" target="_blank">{country.name}</a>'
            )
        return format_html(', '.join(_list))


admin.site.register(ReferenceLayerView, ReferenceLayerViewAdmin)
