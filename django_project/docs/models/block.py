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


class Block(models.Model):
    """Block of an page of documentation."""

    url = models.CharField(
        max_length=128,
        help_text='Relative url of documentation base url'
    )

    anchor = models.CharField(
        max_length=128,
        help_text='Anchor of block on the page on the documentation'
    )

    thumbnail = models.ImageField(
        upload_to='docs/icons',
        null=True,
        blank=True
    )

    title = models.CharField(
        max_length=512,
        null=True,
        blank=True,
        help_text=(
            'Title that will be used on the block. '
            'If not provided, it will use the title of the anchor '
            'on documentation page.'
        )
    )

    description = models.TextField(
        null=True,
        blank=True,
        help_text=(
            'Description that will be used on the block. '
            'If not provided, it will use the first paragraph of the anchor '
            'on the documentation page.'
        )
    )

    class Meta:  # noqa: D106
        ordering = ('anchor',)

    def __str__(self):
        """String of object."""
        return f'{self.title} - {self.url}{self.anchor}'

    @property
    def link(self):
        """String of object."""
        from docs.models.preferences import Preferences
        return Preferences.preferences().documentation_base_url + self.url


class BlockChild(models.Model):
    """Block children"""

    parent = models.ForeignKey(
        Block,
        on_delete=models.CASCADE
    )
    child = models.ForeignKey(
        Block,
        on_delete=models.CASCADE,
        related_name='block_children'
    )
    order = models.IntegerField(default=0)
