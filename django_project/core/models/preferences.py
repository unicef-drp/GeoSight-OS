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

from django.db import models
from django.utils.translation import ugettext_lazy as _

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
        default='https://geosight.kartoza.com'
    )

    disclaimer = models.TextField(
        default=(
            'The boundaries and names shown and the designations used on '
            'this map do not imply official endorsement or acceptance by '
            'the United Nations.'
        )
    )
    # -----------------------------------------------
    # Default Admin Email Addresses
    # send email notification from SignUp and Access Request
    # -----------------------------------------------
    default_admin_emails = models.JSONField(
        default=list,
        blank=True
    )
    # -----------------------------------------------
    # GEOREPO
    # -----------------------------------------------
    georepo_url = models.CharField(
        max_length=512,
        default='https://georepo.kartoza.com/'
    )
    georepo_api_key_level_1 = models.CharField(
        max_length=512,
        default=''
    )
    georepo_api_key_level_4 = models.CharField(
        max_length=512,
        default=''
    )
    georepo_azure_authentication_url = models.TextField(
        blank=True, null=True
    )

    # -----------------------------------------------
    # LANDING PAGE
    # -----------------------------------------------
    landing_page_banner = models.FileField(
        null=True, blank=True,
        upload_to='settings/images'
    )
    landing_page_banner_text = models.TextField(
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
    icon = models.FileField(
        upload_to='settings/icons',
        null=True,
        blank=True
    )
    favicon = models.FileField(
        upload_to='settings/icons',
        null=True,
        blank=True
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

    class Meta:  # noqa: D106
        verbose_name_plural = "site preferences"

    @staticmethod
    def preferences() -> "SitePreferences":
        """Load Site Preference."""
        return SitePreferences.load()

    def __str__(self):
        return 'Site Preference'


class SitePreferencesImage(models.Model):
    """Preference images settings specifically for website."""

    preference = models.ForeignKey(
        SitePreferences,
        on_delete=models.CASCADE
    )
    image = models.FileField(
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
