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

from core.forms.maintenance import MaintenanceModelForm
from core.forms.profile import ProfileForm
from core.forms.site_preferences import SitePreferencesForm
from core.forms.user import (
    AdminUserChangeForm, AzureAdminUserChangeForm,
    AzureAdminUserCreationForm
)
from core.models import (
    SitePreferences, SitePreferencesImage, Profile, ApiKey
)
from core.models.access_request import UserAccessRequest
from core.models.color import ColorPalette
from core.models.maintenance import Maintenance

User = get_user_model()
admin.site.unregister(User)


class SitePreferencesImageInline(admin.TabularInline):
    """SitePreferencesImageTheme inline."""

    model = SitePreferencesImage
    extra = 0


class SitePreferencesAdmin(admin.ModelAdmin):
    """Site Preferences admin."""

    form = SitePreferencesForm
    fieldsets = (
        (None, {
            'fields': (
                'site_title', 'site_url', 'disclaimer',
                'default_basemap', 'default_color_palette',
                'enable_local_dataset'
            )
        }),
        ('Environment', {
            'fields': (
                'sentry_dsn', 'sentry_environment'
            )
        }),
        ('GeoRepo', {
            'fields': (
                'georepo_url',
                'georepo_api_key_level_1', 'georepo_api_key_level_1_email',
                'georepo_api_key_level_4', 'georepo_api_key_level_4_email',
                'georepo_using_user_api_key', 'enable_georepo'
            ),
        }),
        ('Landing Page', {
            'fields': (
                'landing_page_banner', 'landing_page_banner_text'
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
        ('Default Time Mode', {
            'fields': (
                'fit_to_current_indicator_range',
                'show_last_known_value_in_range',
                'default_interval'
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
        ('Compare Mode', {
            'fields': (
                'style_compare_mode_outline_size',
            ),
        }),
        ('Login Page', {
            'fields': (
                'login_help_text',
            )
        })
    )
    inlines = (SitePreferencesImageInline,)
    readonly_fields = ('sentry_dsn', 'sentry_environment')


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

    form = ProfileForm
    model = Profile


class CustomUserAdmin(UserAdmin):
    """Custom user that has profile model."""

    list_display = (
        'username', 'email', 'first_name', 'last_name', 'is_staff',
        'role', 'receive_notification', 'able_to_manage_local_dataset'
    )
    inlines = (ProfileInline,)

    def role(self, obj):
        """Role of user."""
        if obj.profile:
            return obj.profile.role
        return '-'

    def receive_notification(self, obj):
        """receive_notification of user."""
        if obj.profile:
            return obj.profile.receive_notification
        return False

    def able_to_manage_local_dataset(self, obj):
        """receive_notification of user."""
        if obj.profile:
            return obj.profile.able_to_manage_local_dataset
        return False

    receive_notification.boolean = True
    able_to_manage_local_dataset.boolean = True


# USER ADMIN BASED ON USING AZURE OR NOT
if settings.USE_AZURE:
    class UserProfileAdmin(CustomUserAdmin):
        """User profile admin."""

        add_form_template = None
        form = AzureAdminUserChangeForm
        add_form = AzureAdminUserCreationForm
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
    class UserProfileAdmin(CustomUserAdmin):
        """User profile admin."""

        form = AdminUserChangeForm


    admin.site.register(User, UserProfileAdmin)


class UserAccessRequestAdmin(admin.ModelAdmin):
    """User access request admin."""

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


class APIKeyAdmin(admin.ModelAdmin):
    """API key admin admin."""

    list_display = (
        'get_user', 'platform', 'owner', 'contact',
        'get_created', 'is_active', 'expiry'
    )
    fields = ('platform', 'owner', 'contact', 'is_active')

    @admin.display(ordering='token__user__username', description='User')
    def get_user(self, obj):
        """Return user."""
        return obj.token.user

    @admin.display(ordering='token__created', description='Created')
    def get_created(self, obj):
        """Return token."""
        return obj.token.created

    def has_add_permission(self, request, obj=None):
        """Remove add permission."""
        return False


admin.site.register(ApiKey, APIKeyAdmin)


class MaintenanceAdmin(admin.ModelAdmin):
    """Maintenance admin."""

    form = MaintenanceModelForm
    list_display = (
        'id', 'scheduled_from', 'scheduled_end', 'creator', 'created_at'
    )

    def save_model(self, request, obj, form, change):
        """Save maintenance model."""
        obj.creator = request.user
        super().save_model(request, obj, form, change)


admin.site.register(Maintenance, MaintenanceAdmin)
