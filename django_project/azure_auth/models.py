# coding=utf-8
"""
GeoSight is UNICEF’s geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '26/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth.models import Group
from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _


class RegisteredDomain(models.Model):
    """Registered domain for azure authentication."""

    domain = models.CharField(max_length=256, unique=True)
    group = models.ForeignKey(
        Group, null=True, blank=True, on_delete=models.SET_NULL,
        help_text=_(
            'Autoassign user under the domain to the group.'
        )
    )
