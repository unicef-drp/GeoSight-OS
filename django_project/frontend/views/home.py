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

from frontend.views._base import BaseView


class HomePageView(BaseView):
    """Home Create View."""

    template_name = 'frontend/home.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Home'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return 'Home'
