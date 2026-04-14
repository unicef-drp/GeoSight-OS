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

import re

from django.db import models
from django.db.models import Q

from docs.models.block import Block


class Page(models.Model):
    """Page of documentation."""

    name = models.CharField(
        max_length=512,
        help_text='Page name that will be used for frontend help center.',
        unique=True
    )

    relative_url = models.CharField(
        verbose_name='Relative Page Url',
        max_length=128,
        null=True,
        blank=True,
        help_text=(
            'Relative page url as identifier to be matched for the page that '
            'are opened. Example: put `/project`, it will use this page '
            'as help center when we are in /project.'
        )
    )

    url = models.CharField(
        verbose_name='Relative Documentation Url',
        max_length=128,
        help_text=(
            'Relative url of documentation base url that will be used as '
            '"Visit our documentation" button.'
        )
    )

    title = models.CharField(
        max_length=512,
        null=True,
        blank=True,
        help_text=(
            'If no title is provided, it will use the title of the anchor '
            'on documentation page.'
        )
    )

    intro = models.TextField(
        null=True,
        blank=True,
        help_text=(
            'Help intro for this page help center, '
            'below title and upper of blocks.'
        )
    )

    autogenerate_block = models.BooleanField(
        default=True,
        help_text=(
            'Autogenerate blocks from the documentation. '
            'If unchecked, it will use blocks child of this page.'
        )
    )

    def __str__(self):
        """Return string of object."""
        return self.name

    @property
    def link(self):
        """String of object."""
        from docs.models.preferences import Preferences
        return Preferences.preferences().documentation_base_url + self.url

    @staticmethod
    def get_page(relative_url: str):
        """Return page based on relative url."""
        # Strip language prefix e.g. /en-us/admin/ -> /admin/
        relative_url = re.sub(r'^/[a-z]{2}(-[a-z]{2})?/', '/', relative_url)
        root = Page.objects.filter(
            Q(relative_url='') | Q(relative_url__isnull=True)
        ).first()
        page = root
        if relative_url:
            urls = []
            if relative_url[0] == '/':
                relative_url = relative_url[1:]
            relative_urls = relative_url.split('/')
            for idx, url in enumerate(relative_urls):
                urls.append(relative_urls[:(idx + 1)])
            urls_query = ['/'.join(url) for url in urls]
            urls_query += ['/'.join(url + ['']) for url in urls]
            urls_query += ['/'.join([''] + url) for url in urls]
            urls_query += ['/'.join([''] + url + ['']) for url in urls]
            page = Page.objects.filter(relative_url__in=urls_query).order_by(
                '-relative_url').first()
            if not page:
                page = root
        return page


class PageBlock(models.Model):
    """Page block"""

    page = models.ForeignKey(Page, on_delete=models.CASCADE)
    block = models.ForeignKey(Block, on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
