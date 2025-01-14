# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '14/01/2024'
__copyright__ = ('Copyright 2023, Unicef')


class BaseAdminMixin:
    """Mixins for base admin."""

    def save_model(self, request, obj, form, change):
        """Save model in Django admin page."""
        instance = form.save(commit=False)
        instance.modified_by = request.user
        instance.save()
        form.save_m2m()
        return instance
