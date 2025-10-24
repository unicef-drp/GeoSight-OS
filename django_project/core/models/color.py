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

from django.contrib.postgres.fields import ArrayField
from django.core.validators import RegexValidator
from django.db import models

from core.models import AbstractTerm

hex_color_validator = RegexValidator(
    regex=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$",
    message="Color must be a valid hex code in #RRGGBB or #RRGGBBAA format."
)


class ColorPalette(AbstractTerm):
    """Model of color palette."""

    colors = ArrayField(
        models.CharField(max_length=9, validators=[hex_color_validator])
    )

    class Meta:  # noqa: D106
        ordering = ('name',)
