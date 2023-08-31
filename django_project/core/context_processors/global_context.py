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
import os

from django.conf import settings

from core.models.preferences import SitePreferences
from core.serializer.site_preferences import SitePreferencesSerializer
from core.settings.utils import ABS_PATH
from geosight.georepo.request import GeorepoUrl


def project_version(request):
    """Read project version from file."""
    folder = ABS_PATH('version')
    version = ''
    version_file = os.path.join(folder, 'version.txt')
    if os.path.exists(version_file):
        version += (open(version_file, 'rb').read()).decode("utf-8")
    commit_file = os.path.join(folder, 'commit.txt')
    if os.path.exists(commit_file):
        commit = (open(commit_file, 'rb').read()).decode("utf-8")[:5]
        if commit:
            version += '-' + commit
    return version


def global_context(request):
    """Global context that will be returned for every request."""
    # Return api_key level 1 if user not have api_key
    pref = SitePreferences.preferences()
    pref_data = SitePreferencesSerializer(pref).data
    pref_data['georepo_api'] = GeorepoUrl().details
    if request.user.is_authenticated and pref.georepo_using_user_api_key:
        pref_data['georepo_api'] = GeorepoUrl(
            api_key=request.user.profile.georepo_api_key_val,
            api_key_email=request.user.email

        ).details
    return {
        'preferences': pref_data,
        'preferences_js': json.dumps(pref_data),
        'use_azure_auth': settings.USE_AZURE,
        'version': project_version(request)
    }
