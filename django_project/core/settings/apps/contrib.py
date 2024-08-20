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
__date__ = '20/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

CONTRIB_APPS = [
    'rest_framework',
    'rest_framework_gis',
    'webpack_loader',
    'django_celery_beat',
    'django_celery_results',
    'captcha',
    'knox',
    'drf_yasg',
    'tinymce'
]
CONTRIB_APPS_TENANT = [
    'rest_framework',
    'rest_framework_gis',
    'knox'
]
