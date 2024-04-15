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

from django.contrib.auth.views import LoginView
from core.models.preferences import SitePreferences
from core.serializer.user import UserSerializer


class LoginPageView(LoginView):
    """Login Create View."""

    template_name = 'frontend/login.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Log In'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return 'Log In'

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        next = self.request.GET.get('next', '')
        context.update({
            'content_title': self.content_title,
            'page_title': self.page_title,
            'user': {},
            'no_access': self.request.GET.get('no_access', False),
            'redirect_next_uri': next,
            'login_help_text': SitePreferences.preferences().login_help_text
        })
        if self.request.user.is_authenticated:
            context['user'] = UserSerializer(self.request.user).data
        return context
