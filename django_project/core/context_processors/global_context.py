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

from core.models.preferences import SitePreferences, SiteType
from core.serializer.site_preferences import SitePreferencesSerializer
from core.settings.utils import ABS_PATH
from geosight.data.models.code import CodeList
from geosight.data.models.style.base import (
    StyleTypeChoices,
    DynamicClassificationTypeChoices
)
from geosight.data.serializer.code import CodeListSerializer
from geosight.georepo.request import GeorepoUrl


def project_version(request):
    """Read the project version from the version file.

    :param request: The HTTP request object.
    :type request: HttpRequest
    :return: Project version string (with commit hash if not production).
    :rtype: str
    """
    folder = ABS_PATH('')
    version = ''
    version_file = os.path.join(folder, '_version.txt')
    if os.path.exists(version_file):
        version += (open(version_file, 'rb').read()).decode("utf-8")
    pref = SitePreferences.preferences()

    # If not production, show commit
    if pref.site_type != SiteType.PRODUCTION:
        commit_file = os.path.join(folder, '_commit_hash.txt')
        if os.path.exists(commit_file):
            commit = (open(commit_file, 'rb').read()).decode("utf-8")[:5]
            if commit:
                version += '-' + commit
    return version


def global_context(request):
    """
    Build the global context dictionary for every request.

    This includes application settings, site preferences, API keys,
    version information, and other configuration values that are
    available globally in templates.

    :param request: The HTTP request object.
    :type request: HttpRequest
    :return: A dictionary containing global context values.
    :rtype: dict
    """
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
        'DEBUG': settings.DEBUG,
        'IS_TEST': settings.IS_TEST,
        'preferences': pref_data,
        'preferences_js': json.dumps(pref_data),
        'use_azure_auth': settings.USE_AZURE,
        'version': project_version(request),
        'plugins': settings.PLUGINS,
        # For specific dashboard
        'dynamic_classification': json.dumps(
            DynamicClassificationTypeChoices
        ),
        'style_types': json.dumps(StyleTypeChoices),
        'code_list': json.dumps(
            CodeListSerializer(CodeList.objects.all(), many=True).data
        ),
    }
