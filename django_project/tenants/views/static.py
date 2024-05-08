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
__date__ = '08/06/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os

from django.views.static import serve as django_serve


def serve(request, path, document_root=None, show_indexes=False):
    """Serve static file for tenants."""
    tenant = request.tenant
    if document_root and tenant and tenant.id:
        document_root = os.path.join(document_root, tenant.schema_name)
    return django_serve(
        request, path, document_root=document_root, show_indexes=show_indexes
    )
