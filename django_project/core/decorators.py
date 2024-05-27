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
__date__ = '27/05/2024'
__copyright__ = ('Copyright 2023, Unicef')

from functools import wraps

from django.utils.cache import patch_cache_control


def cache_control(**kwargs):
    def _cache_controller(viewfunc):
        @wraps(viewfunc)
        def _cache_controlled(request, *args, **kw):
            response = viewfunc(request, *args, **kw)
            if request.GET.get('version', None):
                patch_cache_control(response, **kwargs)
            return response

        return _cache_controlled

    return _cache_controller
