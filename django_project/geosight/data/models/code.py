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

from django.contrib.gis.db import models

from core.models import AbstractTerm


class Code(AbstractTerm):
    """The code list."""

    value = models.CharField(
        max_length=512,
        help_text='Code value that used as a code.',
        unique=True
    )

    @property
    def code(self):
        """Return code of the code."""
        return self.value

    @property
    def label(self):
        """Return label of the code."""
        return f'{self.name} ({self.value})'


class CodeList(AbstractTerm):
    """The CodeList."""

    def codes(self, value_only=False):
        """Return code list."""
        if value_only:
            return list(
                self.codeincodelist_set.values_list('code__value', flat=True)
            )
        codes = []
        for code_in_codelist in self.codeincodelist_set.all():
            codes.append(code_in_codelist.code)
        return codes

    class Meta:  # noqa: D106
        verbose_name = 'Codelist'
        verbose_name_plural = 'Codelists'


class CodeInCodeList(models.Model):
    """The code list."""

    codelist = models.ForeignKey(
        CodeList, on_delete=models.CASCADE
    )
    code = models.ForeignKey(
        Code, on_delete=models.CASCADE
    )
    order = models.IntegerField(
        default=0
    )

    class Meta:  # noqa: D106
        ordering = ('order',)
        unique_together = ('codelist', 'code')
