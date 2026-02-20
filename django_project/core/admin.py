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
                'site_title', 'site_url', 'site_type', 'disclaimer',
                'send_feedback_url', 'contact_us_url',
                'default_basemap', 'default_color_palette',
            )
        }),
        ('Environment', {
            'fields': (
                'sentry_dsn', 'sentry_environment', 'ogr_version'
            )
        }),
        ('Plugins', {
            'fields': (
                'cloud_native_gis_enabled',
                'machine_info_fetcher_enabled',
                'reference_dataset_enabled',
                'tenants_enabled',
                'machine_info_fetcher_config',
            )
        }),
        ('GeoRepo', {
            'fields': (
                'georepo_url',
                'georepo_api_key_level_1', 'georepo_api_key_level_1_email',
                'georepo_api_key_level_4', 'georepo_api_key_level_4_email',
                'georepo_using_user_api_key',
                'georepo_default_dataset_uuid',
                'georepo_default_view'
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
                'icon', 'small_icon',
                'favicon'
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
    readonly_fields = (
        'sentry_dsn', 'sentry_environment',
        'cloud_native_gis_enabled',
        'machine_info_fetcher_enabled',
        'reference_dataset_enabled',
        'tenants_enabled',
        'ogr_version'
    )
    raw_id_fields = ('georepo_default_view',)


admin.site.register(SitePreferences, SitePreferencesAdmin)


class ColorPaletteAdmin(admin.ModelAdmin):
    """Color Palette admin."""

    list_display = ('name', '_colors')

    def _colors(self, obj: ColorPalette):
        """
        Return an HTML representation of the colors in a palette.

        This method generates small colored square blocks for each color in
        the given :class:`ColorPalette`. Each block is styled as a 20x20 pixel
        square with its background set to the color value.
        The ``title`` attribute of each block contains the color string.

        :param obj: The color palette instance containing a list of colors.
        :type obj: ColorPalette
        :return:
            An HTML string marked safe for rendering, containing the
            color squares for each color in the palette.
        :rtype: str
        """
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
        'role', 'receive_notification'
    )
    inlines = (ProfileInline,)

    def role(self, obj):
        """
        Return the role of a user.

        This method checks if the given object has an associated profile.
        If so, it returns the profile's role. Otherwise, it returns ``"-"``.

        :param obj: The user object being inspected.
        :type obj: User
        :return: The role of the user, or ``"-"`` if no profile exists.
        :rtype: str
        """
        if obj.profile:
            return obj.profile.role
        return '-'

    def receive_notification(self, obj):
        """
        Return whether the user receives notifications.

        This method checks if the given object has an associated profile.
        If so, it returns the profile's ``receive_notification`` value.
        Otherwise, it returns ``False``.

        :param obj: The user object being inspected.
        :type obj: User
        :return:
            ``True`` if the user has notifications enabled,
            otherwise ``False``.
        :rtype: bool
        """
        if obj.profile:
            return obj.profile.receive_notification
        return False

    receive_notification.boolean = True


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
    def get_user(self, obj):  # noqa: DOC101, DOC103, DOC201
        """Return user."""
        return obj.token.user

    @admin.display(ordering='token__created', description='Created')
    def get_created(self, obj):  # noqa: DOC101, DOC103, DOC201
        """Return token."""
        return obj.token.created

    def has_add_permission(  # noqa: DOC101, DOC103, DOC201
            self, request, obj=None
    ):
        """Remove add permission."""
        return False


admin.site.register(ApiKey, APIKeyAdmin)


class MaintenanceAdmin(admin.ModelAdmin):
    """Maintenance admin."""

    form = MaintenanceModelForm
    list_display = (
        'id', 'scheduled_from', 'scheduled_end', 'creator', 'created_at'
    )

    def save_model(  # noqa: DOC101, DOC103, DOC201
            self, request, obj, form, change
    ):
        """Save maintenance model."""
        obj.creator = request.user
        super().save_model(request, obj, form, change)


admin.site.register(Maintenance, MaintenanceAdmin)
