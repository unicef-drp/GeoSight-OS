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


class SingletonModel(models.Model):
    """Singleton Abstract Model that just have 1 data on database."""

    class Meta:  # noqa: D106
        abstract = True

    def save(self, *args, **kwargs):
        """Save model."""
        self.pk = 1
        super(SingletonModel, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Delete model."""
        pass

    @classmethod
    def load(cls):
        """Load the singleton model with 1 object."""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
