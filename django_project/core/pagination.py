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

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class Pagination(PageNumberPagination):
    """Pagination for API."""

    page_size_query_param = 'page_size'

    def get_paginated_response_data(self, data):
        """
        Build and return the paginated response data structure.

        :param data: Serialized list of objects for the current page.
        :type data: list or dict
        :return: Dictionary containing pagination metadata and results.
        :rtype: dict
        """
        return {
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'count': self.page.paginator.count,
            'page': self.page.number,
            'total_page': self.page.paginator.num_pages,
            'page_size': self.page.paginator.per_page,
            'results': data,
        }

    def get_paginated_response(self, data):
        """
        Generate the paginated :class:`Response` object for the API.

        :param data: Serialized data for the current page.
        :type data: list or dict
        :return: A REST framework :class:`Response` containing paginated data.
        :rtype: rest_framework.response.Response
        """
        return Response(self.get_paginated_response_data(data))


class GeojsonPagination(Pagination):
    """Geojson pagination for API."""

    def get_paginated_response_data(self, data):
        """
        Return GeoJSON data without pagination metadata.

        :param data:
            GeoJSON features or feature collection for the current page.
        :type data: dict
        :return: The GeoJSON data as-is.
        :rtype: dict
        """
        return data
