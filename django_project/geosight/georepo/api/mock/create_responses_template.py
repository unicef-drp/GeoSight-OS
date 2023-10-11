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
__date__ = '10/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
import os
import shutil
from urllib.parse import urlparse

import requests

GEOREPO_API_URL = ''
GEOREPO_TOKEN = ''
GEOREPO_TOKEN_EMAIL = ''

GEOREPO_DATASET_UUID = ''
GEOREPO_VIEW_UUID = ''


class GeorepoUrl:
    """Reference Layer Control."""

    api_key_is_public = False
    FOLDER = 'responses'

    def __init__(
            self, georepo_url, api_key: str = None, api_key_email: str = None
    ):
        """Init Class."""
        self.georepo_url = georepo_url.strip('/')
        parsed = urlparse(self.georepo_url)
        self.georepo_domain = parsed.scheme + '://' + parsed.netloc
        self.georepo_api_key = api_key
        self.georepo_api_key_email = api_key_email

        self.headers = {
            'Authorization': f'Token {self.georepo_api_key}',
            'GeoRepo-User-Key': self.georepo_api_key_email
        }

    @property
    def module_list(self) -> str:
        """Return API link for module list."""
        return (
            f'{self.georepo_url}/search/module/list/?cached=False'
        )

    def reference_layer_list(self, module_uuid: str) -> str:
        """Return API link for reference list."""
        return (
            f'{self.georepo_url}/search/module/{module_uuid}/dataset/list/'
            f'?cached=False'
        )

    def reference_layer_views(self, reference_layer_uuid) -> str:
        """Return API link for reference detail."""
        return (
            f'{self.georepo_url}/search/dataset/{reference_layer_uuid}'
            f'/view/list?cached=False'
        )

    def view_detail(self, view_uuid):
        """Return API of view detail."""
        return (
            f'{self.georepo_url}/search/view/{view_uuid}/'
            f'?cached=False'
        )


class GeorepoGenerator:
    """Create responses for mock."""

    page_size = 25
    FOLDER = 'responses'

    def __init__(self):
        """Init Class."""
        self.urls = GeorepoUrl(
            georepo_url=GEOREPO_API_URL,
            api_key=GEOREPO_TOKEN,
            api_key_email=GEOREPO_TOKEN_EMAIL
        )
        if os.path.isdir(os.path.join(self.FOLDER, 'api')):
            shutil.rmtree(os.path.join(self.FOLDER, 'api'))

    def get(self, url):
        """GET requests."""
        return requests.get(url, headers=self.urls.headers)

    def post(self, url, data: json):
        """GET requests."""
        return requests.post(url, json=data, headers=self.urls.headers)

    def _file(self, url):
        """Return file of response."""
        # Writing to response.json
        parsed_url = urlparse(url)

        _folder = os.path.join(self.FOLDER, parsed_url.path[1:])
        if not os.path.exists(_folder):
            os.makedirs(_folder)

        return os.path.join(_folder, 'response.json')

    def save_response(self, url: str, data: dict):
        """Save response."""
        print('----------------------')
        print(url)
        print(data)
        # Serializing json
        json_str = json.dumps(data, indent=4)
        json_str = json_str.replace(
            GEOREPO_API_URL,
            '/georepo/mock/api/v1/'
        )
        _file = self._file(url)
        with open(_file, 'w+') as outfile:
            outfile.write(json_str)

    def _request_paginated(self, url: str, page: int = 1) -> list:
        """Return list of responses of paginated request."""
        if '?' not in url:
            url_request = f'{url}?page={page}&page_size={self.page_size}'
        else:
            url_request = f'{url}&page={page}&page_size={self.page_size}'
        response = self.get(url_request)
        if response.status_code != 200:
            raise Exception(
                f'Error fetching on {url_request} '
                f'- {response.status_code} - {response.text}'
            )
        result = response.json()
        if result['total_page'] <= page:
            return result['results']
        else:
            return result['results'] + self._request_paginated(url, page + 1)

    def _save_request_paginated(
            self, url: str, filter_fn=None
    ) -> list:
        """Return paginated and save to response."""
        results = self._request_paginated(url)
        if filter_fn:
            results = filter_fn(results)
        data = {
            "page": 1,
            "page_size": 100000,
            "total_page": 1,
            "results": results
        }
        self.save_response(url, data)
        return results

    def _save_get_request(self, url: str):
        """Return reference layer."""
        print(url)
        response = self.get(url)
        if response.status_code != 200:
            raise Exception(
                f'Fetching reference layer detail error '
                f'- {response.status_code} - {response.text}'
            )
        data = response.json()
        self.save_response(url, data)
        return data

    def run(self):
        """Run the generation."""
        if GEOREPO_API_URL == '':
            print('GEOREPO_API_URL is empty. Update this on this file.')
            return
        if GEOREPO_TOKEN == '':
            print('GEOREPO_TOKEN is empty. Update this on this file.')
            return
        if GEOREPO_TOKEN_EMAIL == '':
            print('GEOREPO_TOKEN_EMAIL is empty. Update this on this file.')
            return

        # Extract modules responses
        modules = self._save_request_paginated(
            self.urls.module_list
        )

        # Extract dataset responses
        def dataset_filter_fn(results):
            """Filter desired dataset."""
            return [
                result for result in results if
                result['uuid'] == GEOREPO_DATASET_UUID
            ]

        def view_filter_fn(results):
            """Filter desired view."""
            return [
                result for result in results if
                result['uuid'] == GEOREPO_VIEW_UUID
            ]

        for module in modules:
            datesets = self._save_request_paginated(
                self.urls.reference_layer_list(module['uuid']),
                filter_fn=dataset_filter_fn
            )
            for dateset in datesets:
                views = self._save_request_paginated(
                    self.urls.reference_layer_views(dateset['uuid']),
                    filter_fn=view_filter_fn
                )
                for view in views:
                    data = self._save_get_request(
                        self.urls.view_detail(view['uuid'])
                    )
                    for level in data['dataset_levels']:
                        self._save_request_paginated(
                            level['url']
                        )


GeorepoGenerator().run()
