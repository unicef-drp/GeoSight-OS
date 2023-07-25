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

from django.conf import settings
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from core.forms.user import (
    AdminUserChangeForm, AzureAdminUserChangeForm,
    AzureAdminUserCreationForm
)
from core.models import SitePreferences, SitePreferencesImage, Profile
from core.models.access_request import UserAccessRequest
from core.models.color import ColorPalette

User = get_user_model()
admin.site.unregister(User)


class SitePreferencesImageInline(admin.TabularInline):
    """SitePreferencesImageTheme inline."""

    model = SitePreferencesImage
    extra = 0


class SitePreferencesAdmin(admin.ModelAdmin):
    """Site Preferences admin."""

    fieldsets = (
        (None, {
            'fields': ('site_title', 'site_url', 'disclaimer')
        }),
        ('Email', {
            'fields': (
                'default_admin_emails',
            )
        }),
        ('GeoRepo', {
            'fields': (
                'georepo_url',
                'georepo_api_key_level_1', 'georepo_api_key_level_4'
            ),
        }),
        ('Theme', {
            'fields': (
                'primary_color', 'anti_primary_color',
                'secondary_color', 'anti_secondary_color',
                'tertiary_color', 'anti_tertiary_color',
                'icon', 'favicon'
            ),
        }),
        ('Default Style Configuration', {
            'fields': (),
        }),
        ('New Rule', {
            'fields': (
                'style_new_rule_fill_color',
                'style_new_rule_outline_color',
                'style_new_rule_outline_size',
            ),
        }),
        ('No Data', {
            'fields': (
                'style_no_data_fill_color',
                'style_no_data_outline_color',
                'style_no_data_outline_size',
            ),
        }),
        ('Other Data', {
            'fields': (
                'style_other_data_fill_color',
                'style_other_data_outline_color',
                'style_other_data_outline_size',
            ),
        }),
        ('Dynamic Style', {
            'fields': (
                'style_dynamic_style_outline_color',
                'style_dynamic_style_outline_size',
            ),
        }),
    )
    inlines = (SitePreferencesImageInline,)


admin.site.register(SitePreferences, SitePreferencesAdmin)


class ColorPaletteAdmin(admin.ModelAdmin):
    """Color Palette admin."""

    list_display = ('name', '_colors')

    def _colors(self, obj: ColorPalette):
        """Return colors that palette has."""
        html = ''
        for color in obj.colors:
            html += (
                f'<div style="display:inline-block; height:20px; width:20px; '
                f'background-color:{color}" title="{color}"></div>'
            )
        return mark_safe(html)

    _colors.allow_tags = True


admin.site.register(ColorPalette, ColorPaletteAdmin)


class ProfileInline(admin.StackedInline):
    """Profile inline."""

    model = Profile


# USER ADMIN BASED ON USING AZURE OR NOT
if settings.USE_AZURE:
    class UserProfileAdmin(UserAdmin):
        """User profile admin."""

        add_form_template = None
        form = AzureAdminUserChangeForm
        add_form = AzureAdminUserCreationForm
        inlines = (ProfileInline,)
        list_display = (
            'username', 'email', 'first_name', 'last_name', 'is_staff'
        )
        add_fieldsets = (
            (None, {
                'classes': ('wide',),
                'fields': ('email',),
            }),
        )
        fieldsets = (
            (None, {'fields': ('email',)}),
            (_('Personal info'),
             {'fields': ('first_name', 'last_name')}),
            (_('Permissions'), {
                'fields': (
                    'is_active', 'is_staff', 'is_superuser', 'groups',
                    'user_permissions'
                ),
            }),
            (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        )


    admin.site.register(User, UserProfileAdmin)
else:
    class UserProfileAdmin(UserAdmin):
        """User profile admin."""

        form = AdminUserChangeForm
        inlines = (ProfileInline,)


    admin.site.register(User, UserProfileAdmin)


class UserAccessRequestAdmin(admin.ModelAdmin):
    list_display = (
        'requester_email', 'requester_first_name', 'type',
        'status', 'submitted_on'
    )
    list_filter = [
        'type', 'status'
    ]
    search_fields = [
        'requester_first_name', 'requester_email'
    ]


admin.site.register(UserAccessRequest, UserAccessRequestAdmin)
