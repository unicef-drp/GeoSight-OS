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

import os

# Absolute filesystem path to the Django project directory:
DJANGO_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    ))


def ABS_PATH(*args):
    """Return absolute path of django project.

    :param *args: list of path components to join with the project path
    :type *args: list of str
    :return: absolute path of the project joined with
        the provided path components
    :rtype: str
    """
    return os.path.join(DJANGO_ROOT, *args)


def code_release_version():
    """Read code release version from file.

    :return: code release version
    :rtype: str
    """
    version = ABS_PATH('_version.txt')
    if os.path.exists(version):
        try:
            with open(version, 'rb') as f:
                version = f.read().decode("utf-8")
        except Exception:
            version = None
        if version:
            return version.strip()
    return '0.0.1'
