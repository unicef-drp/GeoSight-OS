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

from urllib import parse

from django.urls import reverse
from django.utils.encoding import force_str
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.indicator.indicator_value_dataset import (
    IndicatorValueDataset
)


class IndicatorValueDatasetSerializer(DynamicModelSerializer):
    """Serializer for IndicatorValue."""

    id = serializers.SerializerMethodField()
    browse_data_api_url = serializers.SerializerMethodField()
    browse_url = serializers.SerializerMethodField()
    permission = serializers.SerializerMethodField()

    def get_id(self, obj: IndicatorValueDataset):
        """Return id."""
        return (
            f'{obj.indicator_id}-{obj.country_id}-'
            f'[{obj.admin_level}]'
        )

    def get_browse_data_api_url(self, obj: IndicatorValueDataset):
        """Return browse data API url."""
        url = self.context.get('browse-data', None)
        (scheme, netloc, path, query, fragment) = parse.urlsplit(
            force_str(url)
        )
        query_dict = parse.parse_qs(query, keep_blank_values=True)
        for key, value in query_dict.items():
            value = None
            if key == 'page':
                value = 1
            elif 'indicator_id' in key:
                value = obj.indicator_id
            elif 'country_id' in key:
                value = obj.country_id
            elif 'admin_level' in key:
                value = obj.admin_level

            if value is not None:
                query_dict[key] = value
        query = parse.urlencode(sorted(query_dict.items()), doseq=True)
        return parse.urlunsplit((scheme, netloc, path, query, fragment))

    def get_browse_url(self, obj: IndicatorValueDataset):
        """Return browse data API url."""
        return (
            f"{reverse('admin-data-browser-view')}?"
            f"indicators={obj.indicator_id}&"
            f"countries={obj.country_id}&"
            f"levels={obj.admin_level}"
        )

    class Meta:  # noqa: D106
        model = IndicatorValueDataset
        fields = '__all__'

    def get_permission(self, obj: IndicatorValueDataset):
        """Return permission."""
        return obj.permissions(self.context.get('user', None))
