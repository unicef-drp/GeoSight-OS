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

import json

from django.shortcuts import render
from django.views.generic import View

from core.serializer.user import UserSerializer


class BaseView(View):
    """Base View."""

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = {
            'content_title': self.content_title,
            'page_title': self.page_title,
            'header_title': self.header_title,
            'user': {}
        }
        if self.request.user.is_authenticated:
            user_data = UserSerializer(self.request.user).data
            if self.request.user.profile:
                user_data[
                    'georepo_api_key'
                ] = self.request.user.profile.georepo_api_key_val

            context['user'] = json.dumps(user_data)
        return context

    def get(self, request, **kwargs):
        """GET function."""
        return render(
            request,
            self.template_name,
            self.get_context_data(**kwargs)
        )

    @property
    def template_name(self):
        """Return template name."""
        raise NotImplementedError

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        raise NotImplementedError

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        raise NotImplementedError

    @property
    def header_title(self):
        """Return content title that will be show on the header."""
        return ""
