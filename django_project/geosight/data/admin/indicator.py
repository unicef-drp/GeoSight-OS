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
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from geosight.data.admin.base import BaseAdminResourceMixin
from geosight.data.models.indicator import (
    Indicator, IndicatorGroup,
    IndicatorValue, IndicatorRule, IndicatorExtraValue
)


class NullEntityFilter(admin.SimpleListFilter):
    """Null entity filter."""

    title = _('Entity Null')
    parameter_name = 'is_entity_null'

    def lookups(self, request, model_admin):
        """
        Return the list of lookup options.

        :param request: HttpRequest
            The current request object.
        :type request: django.http.HttpRequest
        :param model_admin: ModelAdmin
            The admin model instance.
        :type model_admin: django.contrib.admin.ModelAdmin
        :return: A list of tuples for lookup options.
        :rtype: list[tuple[str, str]]
        """
        return [
            ('yes', _('Is NULL')),
            ('no', _('Is NOT NULL')),
        ]

    def queryset(self, request, queryset):  # noqa: DOC109, DOC110
        """
        Return the filtered queryset based on selection.

        :param request: django.http.HttpRequest — The current request.
        :param queryset: django.db.models.QuerySet — The base queryset.
        :return: django.db.models.QuerySet — The filtered queryset.
        """
        if self.value() == 'yes':
            return queryset.filter(entity_id__isnull=True)
        if self.value() == 'no':
            return queryset.filter(entity_id__isnull=False)
        return queryset


class NullCountryFilter(admin.SimpleListFilter):
    """Null country filter."""

    title = _('Country Null')
    parameter_name = 'is_country_null'

    def lookups(self, request, model_admin):
        """
        Return the list of lookup options.

        :param request: HttpRequest
            The current request object.
        :type request: django.http.HttpRequest
        :param model_admin: ModelAdmin
            The admin model instance.
        :type model_admin: django.contrib.admin.ModelAdmin
        :return: A list of tuples for lookup options.
        :rtype: list[tuple[str, str]]
        """
        return [
            ('yes', _('Is NULL')),
            ('no', _('Is NOT NULL')),
        ]

    def queryset(self, request, queryset):  # noqa: DOC109, DOC110
        """
        Return the filtered queryset based on selection.

        :param request: The current request.
        :param queryset: The base queryset.
        :return: Filtered queryset.
        """
        if self.value() == 'yes':
            return queryset.filter(country_id__isnull=True)
        if self.value() == 'no':
            return queryset.filter(country_id__isnull=False)
        return queryset


@admin.action(description='Assign flat table selected')
def assign_flat_table_selected(  # noqa: DOC109, DOC110
        modeladmin, request, queryset
):
    """
    Assign selected IndicatorValue objects to the flat table.

    :param modeladmin:
        django.contrib.admin.ModelAdmin — The admin model instance.
    :param request: django.http.HttpRequest — The current request.
    :param queryset:
        django.db.models.QuerySet[IndicatorValue] —
        The queryset of selected IndicatorValue objects.
    """
    IndicatorValue.assign_flat_table_selected(
        list(queryset.values_list('id', flat=True))
    )


@admin.action(description='Assign concept uuid')
def assign_country_concept_uuid(  # noqa: DOC109, DOC110
        modeladmin, request, queryset
):
    """
    Assign country to each selected IndicatorValue object.

    :param modeladmin: The admin model instance.
    :param request: The current request.
    :param queryset: The queryset of selected objects.
    """
    query = (
        """
        UPDATE geosight_data_indicatorvalue AS value
        SET country_concept_uuid=country.concept_uuid
        FROM
            geosight_georepo_entity AS country
        WHERE
            value.country_geom_id = country.geom_id
          AND
            value.country_concept_uuid IS NULL
        """
    )
    with connection.cursor() as cursor:
        cursor.execute(query)


class IndicatorValueAdmin(admin.ModelAdmin):
    """IndicatorValue admin."""

    list_display = (
        'geom_id', 'indicator_name', 'date', 'value',
        'entity_geom_id', 'country_geom_id', 'extra_value'
    )
    list_filter = (NullEntityFilter, NullCountryFilter, 'date')
    search_fields = ('indicator__name', 'geom_id')
    actions = (
        assign_flat_table_selected, assign_country_concept_uuid
    )
    raw_id_fields = ('country', 'entity')

    def entity_geom_id(self, obj: IndicatorValue):
        """
        Return a clickable link to the related entity.

        :param obj:
            The IndicatorValue instance for which to generate the entity link.
        :type obj: IndicatorValue
        :return:
            An HTML anchor tag linking to the related Entity's
            admin change page, or ``'-'`` if no entity is associated.
        :rtype: str
        """
        if not obj.entity_id:
            return '-'
        url = f"/django-admin/geosight_georepo/entity/{obj.entity_id}/change/"
        return format_html(
            f'<a href="{url}" target="_blank">{obj.entity.geom_id}</a>'
        )

    def country_geom_id(self, obj: IndicatorValue):
        """
        Return a clickable link to the related object.

        :param obj:
            The IndicatorValue instance for which to generate the country link.
        :type obj: IndicatorValue
        :return:
            An HTML anchor tag linking to the related Country's
            admin change page, or ``'-'`` if no country is associated.
        :rtype: str
        """
        if not obj.country_id:
            return '-'
        url = f"/django-admin/geosight_georepo/entity/{obj.country_id}/change/"
        return format_html(
            f'<a href="{url}" target="_blank">{obj.country.geom_id}</a>'
        )


class IndicatorRuleInline(admin.TabularInline):
    """IndicatorRule inline."""

    model = IndicatorRule
    extra = 0


@admin.action(description='Invalidate cache')
def invalidate_cache(modeladmin, request, queryset):  # noqa: DOC109, DOC110
    """
    Invalidate the cached values on the frontend by updating the version data.

    :param modeladmin: The admin model instance associated with this action.
    :type modeladmin: django.contrib.admin.ModelAdmin
    :param request: The current HTTP request object.
    :type request: django.http.HttpRequest
    :param queryset: The queryset of selected objects to invalidate.
    :type queryset: django.db.models.QuerySet
    """
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


admin.site.register(IndicatorGroup, IndicatorGroupAdmin)
admin.site.register(IndicatorValue, IndicatorValueAdmin)
admin.site.register(Indicator, IndicatorAdmin)


@admin.register(IndicatorExtraValue)
class IndicatorExtraValueAdmin(admin.ModelAdmin):
    """Indicator extra value admin."""

    list_display = ('indicator_value', 'name', 'value')
    search_fields = ('name',)
