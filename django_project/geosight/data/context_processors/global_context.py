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

from geosight.data.models.link import Link
from geosight.data.serializer.link import LinkSerializer


def global_context(request):
    """Global context that will be returned for every request."""
    links = Link.objects.filter(is_public=True)
    if request.user.is_staff:
        links = Link.objects.all()

    return {
        'links': [dict(d) for d in LinkSerializer(links, many=True).data]
    }
