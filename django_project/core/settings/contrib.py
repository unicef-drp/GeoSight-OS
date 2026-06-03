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

from .base import *  # noqa
from .utils import ABS_PATH as absolute_path

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': True,
        'BUNDLE_DIR_NAME': 'frontend/',  # must end with slash
        'STATS_FILE': ABS_PATH('frontend', 'webpack-stats.prod.json'),
        'POLL_INTERVAL': 0.1,
        'TIMEOUT': None,
        'IGNORE': [r'.+\.hot-update.js', r'.+\.map'],
        'LOADER_CLASS': 'webpack_loader.loader.WebpackLoader',
    }
}

# Django Default Authentication Backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend'
]

# swagger UI settings
SWAGGER_SETTINGS = {
    'TAGS_SORTER': 'alpha',
    'showCommonExtensions': 'true',
    'SECURITY_DEFINITIONS': {
        'ApiKey Auth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization'
        }
    }
}

# knox setting
REST_KNOX = {
    'SECURE_HASH_ALGORITHM': 'cryptography.hazmat.primitives.hashes.SHA512',
    'AUTH_TOKEN_CHARACTER_LENGTH': 64,
    'TOKEN_TTL': None,
    'USER_SERIALIZER': 'knox.serializers.UserSerializer',
    'TOKEN_LIMIT_PER_USER': 1,
    'AUTO_REFRESH': False,
}

# ----------------------------------------------------------------------------
# --------------------------------- PyGeoAPI ---------------------------------
# ----------------------------------------------------------------------------
SERVER_URL = os.environ.get(
    'SERVER_URL', 'http://localhost:2000'
)
_pygeoapi_config_path = os.environ.get(
    'PYGEOAPI_CONFIG',
    absolute_path('core', 'settings', 'pygeoapi', 'pygeoapi-config.yml'),
)
PYGEOAPI_OPENAPI = os.environ.get(
    'PYGEOAPI_OPENAPI',
    absolute_path('core', 'settings', 'pygeoapi', 'pygeoapi-openapi.yml'),
)
PYGEOAPI_SERVER_URL = os.environ.get(
    'PYGEOAPI_SERVER_URL', SERVER_URL + '/cloud-native-gis/ogc'
)
os.environ.setdefault('PYGEOAPI_CONFIG', _pygeoapi_config_path)
os.environ.setdefault('PYGEOAPI_OPENAPI', PYGEOAPI_OPENAPI)
os.environ.setdefault('PYGEOAPI_SERVER_URL', PYGEOAPI_SERVER_URL)
os.environ.setdefault(
    'PYGEOAPI_TEMPLATES_PATH',
    os.environ.get(
        'PYGEOAPI_TEMPLATES_PATH',
        absolute_path('cloud_native_gis', 'templates', 'pygeoapi'),
    ),
)

from pygeoapi.config import get_config  # noqa: E402
from pygeoapi.openapi import load_openapi_document  # noqa: E402
from pygeoapi.util import get_api_rules  # noqa: E402

PYGEOAPI_CONFIG = get_config()
OPENAPI_DOCUMENT = load_openapi_document()
API_RULES = get_api_rules(PYGEOAPI_CONFIG)
