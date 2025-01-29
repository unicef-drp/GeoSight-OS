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
__date__ = '28/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import serializers

from core.models.maintenance import Maintenance


class MaintenanceSerializer(serializers.ModelSerializer):
    """Maintenance serializer."""

    class Meta:  # noqa: D106
        model = Maintenance
        exclude = ()
