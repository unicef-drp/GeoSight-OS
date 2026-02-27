# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '14/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib import admin
from django.utils import timezone

BASE_RESOURCE_FIELD = (
    'creator', 'created_at', 'modified_by', 'modified_at'
)


class BaseAdminResourceMixin(admin.ModelAdmin):
    """
    Mixin for base admin functionality.

    Provides common functionality for admin models that track creator,
    creation date, modifier, and modification date. Automatically sets
    these fields when saving models through the Django admin interface.
    """

    list_display = BASE_RESOURCE_FIELD
    readonly_fields = BASE_RESOURCE_FIELD

    def save_model(self, request, obj, form, change):
        """
        Save model in Django admin page.

        Automatically sets the creator field on creation and updates the
        modified_by field on every save operation.

        :param request: The current HTTP request object.
        :type request: django.http.HttpRequest
        :param obj: The model instance being saved.
        :type obj: django.db.models.Model
        :param form: The ModelForm instance.
        :type form: django.forms.ModelForm
        :param change:
            True if this is a change (edit), False if it's an addition.
        :type change: bool
        :return: The saved model instance.
        :rtype: django.db.models.Model
        """
        instance = form.save(commit=False)
        if not instance.creator:
            instance.creator = request.user
        instance.modified_by = request.user
        instance.save()
        form.save_m2m()
        return instance


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
    queryset.update(
        version_data=timezone.now(),
        cache_data=None,
        cache_data_generated_at=None
    )
