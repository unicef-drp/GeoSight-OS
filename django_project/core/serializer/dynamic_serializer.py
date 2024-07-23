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

from rest_framework import serializers


class DynamicModelSerializer(serializers.ModelSerializer):
    """Dynamic serializer that can receive exclude."""

    def __init__(self, *args, **kwargs):
        """Init class."""
        self.ignore_to_presentation = kwargs.pop(
            'ignore_to_presentation', False
        )
        exclude = kwargs.pop('exclude', None)
        fields = kwargs.pop('fields', None)
        super(DynamicModelSerializer, self).__init__(*args, **kwargs)

        if fields:
            exclude = []
            for field in self.fields:
                if field not in fields:
                    exclude.append(field)

        if exclude:
            for field in exclude:
                try:
                    self.fields.pop(field)
                except KeyError:
                    pass
