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
from django.core import signing
from django.core.signing import BadSignature
from django.db import models
from django.utils.translation import ugettext_lazy as _

from core.models.color import ColorPalette
from core.models.singleton import SingletonModel

DEFAULT_OUTLINE_COLOR = '#FFFFFF'
DEFAULT_OUTLINE_SIZE = 0.5


class SitePreferences(SingletonModel):
    """Preference settings specifically for website.

    Preference contains
    - site_title
    - primary_color
    - secondary_color
    - icon
    -favicon
    """

    site_title = models.CharField(
        max_length=512,
        default=''
    )

    site_url = models.CharField(
        max_length=512,
        default=''
    )

    disclaimer = models.TextField(
        default=(
            'The boundaries and names shown and the designations used on '
            'this map do not imply official endorsement or acceptance by '
            'the United Nations.'
        )
    )
    default_basemap = models.IntegerField(
        null=True, blank=True,
        help_text=(
            'Basemap that will be autoadded to new project '
            'if user has list access.'
        )
    )
    default_color_palette = models.ForeignKey(
        ColorPalette,
        null=True, blank=True,
        help_text=(
            'Color palette that will be autoadded to new indicator '
            'when dynamic style is selected.'
        ),
        on_delete=models.SET_NULL
    )
    activate_local_dataset = models.BooleanField(
        default=True,
        help_text=(
            'Activate feature to use local datasets alongside georepo.'
        )
    )
    # -----------------------------------------------
    # GEOREPO
    # -----------------------------------------------
    georepo_url = models.CharField(
        max_length=512,
        default=''
    )
    georepo_api_key_level_1 = models.CharField(
        max_length=512,
        default=''
    )
    georepo_api_key_level_1_email = models.EmailField(
        blank=True, null=True
    )
    georepo_api_key_level_4 = models.CharField(
        max_length=512,
        default=''
    )
    georepo_api_key_level_4_email = models.EmailField(
        blank=True, null=True
    )
    georepo_using_user_api_key = models.BooleanField(default=True)

    # -----------------------------------------------
    # LANDING PAGE
    # -----------------------------------------------
    landing_page_banner = models.ImageField(
        null=True, blank=True,
        upload_to='settings/images'
    )
    landing_page_banner_text = models.TextField(
        null=True, blank=True,
        default=''
    )

    # -----------------------------------------------
    # THEME
    # -----------------------------------------------
    primary_color = models.CharField(
        max_length=16,
        default='#1CABE2',
        help_text=_(
            'Main color for the website. '
            'Put the hex color with # (e.g. #ffffff) '
            'or put the text of color. (e.g. blue)'
        )
    )
    anti_primary_color = models.CharField(
        max_length=16,
        default=DEFAULT_OUTLINE_COLOR,
        help_text=_(
            'Anti of primary color that used for text in primary color.'
        )
    )
    secondary_color = models.CharField(
        max_length=16,
        default='#374EA2',
        help_text=_(
            'Secondary color that used for example for button. '
        )
    )
    anti_secondary_color = models.CharField(
        max_length=16,
        default=DEFAULT_OUTLINE_COLOR,
        help_text=_(
            'Anti of secondary color that used for text in primary color.'
        )
    )
    tertiary_color = models.CharField(
        max_length=16,
        default='#297CC2',
        help_text=_(
            'Tertiary color that used for example for some special place. '
        )
    )
    anti_tertiary_color = models.CharField(
        max_length=16,
        default=DEFAULT_OUTLINE_COLOR,
        help_text=_(
            'Anti of tertiary color that used for text in primary color.'
        )
    )
    icon = models.ImageField(
        upload_to='settings/icons',
        null=True,
        blank=True
    )
    favicon = models.ImageField(
        upload_to='settings/icons',
        null=True,
        blank=True
    )
    # -----------------------------------------------
    # DEFAULT TIME MODE
    # -----------------------------------------------
    fit_to_current_indicator_range = models.BooleanField(
        default=False
    )
    show_last_known_value_in_range = models.BooleanField(
        default=True
    )

    TIME_MODE_INTERVAL = [
        ("Daily", "Daily"),
        ("Monthly", "Monthly"),
        ("Yearly", "Yearly")
    ]
    default_interval = models.CharField(
        max_length=16,
        choices=TIME_MODE_INTERVAL,
        default='Monthly',
    )
    # -----------------------------------------------
    # LAYER RELATED
    # -----------------------------------------------
    style_new_rule_fill_color = models.CharField(
        max_length=16,
        default='#000000',
        help_text=_(
            'Default fill color for new rule style.'
        ),
        verbose_name="Fill color"
    )
    style_new_rule_outline_color = models.CharField(
        max_length=16,
        default=DEFAULT_OUTLINE_COLOR,
        help_text=_(
            'Default outline color for new rule style.'
        ),
        verbose_name="Outline color"
    )
    style_new_rule_outline_size = models.FloatField(
        default=DEFAULT_OUTLINE_SIZE,
        help_text=_(
            'Default outline size for new rule style.'
        ),
        verbose_name="Outline size"
    )

    style_no_data_fill_color = models.CharField(
        max_length=16,
        default='#D8D8D8',
        help_text=_(
            'Default fill color for no data style.'
        ),
        verbose_name="Fill color"
    )

    style_no_data_outline_color = models.CharField(
        max_length=16,
        default=DEFAULT_OUTLINE_COLOR,
        help_text=_(
            'Default outline color for no data style.'
        ),
        verbose_name="Outline color"
    )
    style_no_data_outline_size = models.FloatField(
        default=DEFAULT_OUTLINE_SIZE,
        help_text=_(
            'Default outline size for no data style.'
        ),
        verbose_name="Outline size"
    )

    style_other_data_fill_color = models.CharField(
        max_length=16,
        default='#A6A6A6',
        help_text=_(
            'Default fill color for other data style.'
        ),
        verbose_name="Fill color"
    )
    style_other_data_outline_color = models.CharField(
        max_length=16,
        default=DEFAULT_OUTLINE_COLOR,
        help_text=_(
            'Default outline color for other data style.'
        ),
        verbose_name="Outline color"
    )
    style_other_data_outline_size = models.FloatField(
        default=DEFAULT_OUTLINE_SIZE,
        help_text=_(
            'Default outline size for other data style.'
        ),
        verbose_name="Outline size"
    )

    style_dynamic_style_outline_color = models.CharField(
        max_length=16,
        default=DEFAULT_OUTLINE_COLOR,
        help_text=_(
            'Default outline color for dynamic style.'
        ),
        verbose_name="Outline color"
    )
    style_dynamic_style_outline_size = models.FloatField(
        default=DEFAULT_OUTLINE_SIZE,
        help_text=_(
            'Default outline size for dynamic style.'
        ),
        verbose_name="Outline size"
    )

    # Compare mode
    style_compare_mode_outline_size = models.FloatField(
        default=4,
        help_text=_(
            'Outline size for compare mode.'
        ),
        verbose_name="Outline size"
    )

    # -----------------------------------------------
    # Login page config
    # -----------------------------------------------
    login_help_text = models.TextField(
        default='',
        null=True, blank=True,
        help_text=_(
            'Help text to show in login page.'
        ),
    )

    class Meta:  # noqa: D106
        verbose_name_plural = "site preferences"

    @staticmethod
    def preferences() -> "SitePreferences":
        """Load Site Preference."""
        obj = SitePreferences.load()
        return obj

    def __str__(self):
        return 'Site Preference'

    @property
    def georepo_api_key_level_1_val(self):
        """Return georepo api key level 1."""
        try:
            return signing.loads(self.georepo_api_key_level_1)
        except (TypeError, BadSignature):
            return ''

    @property
    def georepo_api_key_level_4_val(self):
        """Return georepo api key level 4."""
        try:
            return signing.loads(self.georepo_api_key_level_4)
        except (TypeError, BadSignature):
            return ''

    @property
    def default_admin_emails(self):
        """Return admin emails."""
        from core.models.profile import Profile
        return list(
            Profile.objects.filter(
                receive_notification=True
            ).filter(
                user__email__isnull=False
            ).values_list('user__email', flat=True)
        )

    @property
    def sentry_dsn(self):
        """Return admin emails."""
        return settings.SENTRY_DSN

    @property
    def sentry_environment(self):
        """Return admin emails."""
        return settings.SENTRY_ENVIRONMENT


class SitePreferencesImage(models.Model):
    """Preference images settings specifically for website."""

    preference = models.ForeignKey(
        SitePreferences,
        on_delete=models.CASCADE
    )
    image = models.ImageField(
        upload_to='settings/images'
    )
    title = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        help_text=_('Title of image.')
    )
    description = models.TextField(
        null=True,
        blank=True,
        help_text=_('Description of image.')
    )
