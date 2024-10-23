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
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

from rest_framework import serializers

from geosight.machine_info_fetcher.models import MachineInfo


class MachineInfoSerializer(serializers.ModelSerializer):
    """Serializer for MachineInfo."""

    class Meta:  # noqa: D106
        model = MachineInfo
        fields = '__all__'
