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
__date__ = '22/08/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.db import models

from docs.models.block import Block


class Page(models.Model):
    """Page of documentation."""

    name = models.CharField(
        max_length=512,
        help_text='Page name that will be used for frontend help center.',
        unique=True
    )

    url = models.CharField(
        max_length=128,
        help_text='Relative url of documentation base url'
    )

    title = models.CharField(
        max_length=512,
        help_text='Title that will be used on the page.'
    )

    intro = models.TextField(
        null=True,
        blank=True,
        help_text='Help intro for this page.'
    )

    def __str__(self):
        """String of object."""
        return self.name

    @property
    def link(self):
        """String of object."""
        from docs.models.preferences import Preferences
        return Preferences.preferences().documentation_base_url + self.url


class PageBlock(models.Model):
    """Page block"""

    page = models.ForeignKey(Page, on_delete=models.CASCADE)
    block = models.ForeignKey(Block, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
