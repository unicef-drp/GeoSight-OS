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
__date__ = '23/10/2025'
__copyright__ = ('Copyright 2025, Unicef')

from geosight.georepo.models import ReferenceLayerView


def update_request_reference_dataset(request, key):
    """Update the request query parameters with country geometry IDs.

    If the `reference_dataset` parameter exists in the request query string,
    this function retrieves the corresponding `ReferenceLayerView` object and
    replaces the value of `request.GET[key]` with a comma-separated list of
    country `geom_id`s associated with that dataset.

    :param request: The incoming HTTP request object to modify.
    :type request: django.http.HttpRequest
    :param key: The key in `request.GET` whose value should be updated.
    :type key: str
    """
    request.GET = request.GET.copy()
    reference_dataset = request.GET.get('reference_dataset')
    if reference_dataset:
        # filter by dataset
        dataset = ReferenceLayerView.objects.get(
            identifier=reference_dataset
        )
        request.GET[key] = ','.join(
            dataset.countries.all().values_list(
                'geom_id', flat=True
            )
        )
