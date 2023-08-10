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
import logging
from urllib.parse import urlparse

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import MultipleObjectsReturned
from django.urls import reverse

from core.models.preferences import SitePreferences
from geosight.georepo.request.data import GeorepoEntity

logger = logging.getLogger(__name__)

User = get_user_model()


class GeorepoUrlDoesNotExist(Exception):
    """Error when georepo url is empty."""

    def __init__(self):
        """init."""
        message = (
            'Georepo URL is empty. Please add it on site preferences admin.'
        )
        logger.error(message)
        super().__init__(message)


class GeorepoRequestError(Exception):
    """Error class for Georepo Request."""

    def __init__(self, message):
        """init."""
        logger.error(message)
        self.message = message
        super().__init__(self.message)


class GeorepoEntityDoesNotExist(Exception):
    """Error when entity does not exist."""

    def __init__(self):
        """init."""
        message = 'Georepo entity does not exist.'
        logger.error(message)
        super().__init__(message)


class GeorepoUrl:
    """Reference Layer Control."""

    api_key_is_public = False

    def __init__(self, api_key: str = None):
        """Init Class."""
        pref = SitePreferences.preferences()
        if not pref.georepo_url:
            raise GeorepoUrlDoesNotExist()

        self.georepo_url = pref.georepo_url.strip('/')
        parsed = urlparse(self.georepo_url)
        self.georepo_domain = parsed.scheme + '://' + parsed.netloc

        # Provide api based on default or api_key
        self.georepo_api_key = api_key
        if not self.georepo_api_key:
            if settings.USE_AZURE:
                self.georepo_api_key = pref.georepo_api_key_level_1
            else:
                self.georepo_api_key = pref.georepo_api_key_level_4

        if self.georepo_api_key == pref.georepo_api_key_level_1:
            self.api_key_is_public = True

        self.headers = {
            'Authorization': f'Token {self.georepo_api_key}'
        }
        logger.debug(f'Georepo API Key : {self.georepo_api_key}')

    @property
    def module_list(self) -> str:
        """Return API link for module list."""
        return (
            f'{self.georepo_url}/search/module/list/'
            f'?cached=False'
        )

    def reference_layer_list(self, module_uuid: str) -> str:
        """Return API link for reference list."""
        return (
            f'{self.georepo_url}/search/module/{module_uuid}/dataset/list/'
            f'?cached=False'
        )

    def reference_layer_detail(self, reference_layer_uuid) -> str:
        """Return API link for reference detail."""
        return (
            f'{self.georepo_url}/search/dataset/{reference_layer_uuid}'
            f'?cached=False'
        )

    def reference_layer_views(self, reference_layer_uuid) -> str:
        """Return API link for reference detail."""
        return (
            f'{self.georepo_url}/search/dataset/{reference_layer_uuid}'
            f'/view/list?cached=False'
        )

    def entity_finder(self, reference_layer_uuid, id_type, id) -> str:
        """Return API link for reference detail."""
        return (
            f'{self.georepo_url}/search/dataset/{reference_layer_uuid}'
            f'/entity/identifier/{id_type}/{id}/'
            f'?cached=False'
        )

    @property
    def details(self) -> dict:
        """Return API links in dictionary."""
        return {
            'domain': self.georepo_domain,
            'api': self.georepo_url,
            'reference_layer_detail': self.reference_layer_detail(
                '<identifier>'
            ),
            'view_detail': self.view_detail('<identifier>'),
            'api_key': self.georepo_api_key,
            'api_key_is_public': self.api_key_is_public,
            'is_api_key': True,
        }

    # -------------------------------------------
    # VIEWS
    # -------------------------------------------
    def view_detail(self, view_uuid):
        """Return API of view detail."""
        return (
            f'{self.georepo_url}/search/view/{view_uuid}/'
            f'?cached=False'
        )

    def view_entity_finder(self, view_uuid, id_type, id) -> str:
        """Return API link for reference detail."""
        return (
            f'{self.georepo_url}/search/view/{view_uuid}'
            f'/entity/identifier/{id_type}/{id}/'
            f'?cached=False'
        )


class GeorepoRequest:
    """Request to georepo."""

    page_size = 50

    def __init__(self):
        """Init Class."""
        pref = SitePreferences.preferences()
        if not pref.georepo_url:
            raise GeorepoUrlDoesNotExist()
        self.urls = GeorepoUrl(
            api_key=pref.georepo_api_key_level_4
        )
        self.View = self.ViewRequest(self, self.urls)

    def get(self, url):
        """GET requests."""
        return requests.get(url, headers=self.urls.headers)

    def post(self, url, data: json):
        """GET requests."""
        return requests.post(url, json=data, headers=self.urls.headers)

    def get_reference_layer_list(self):
        """Return reference layer list."""
        modules = self._request_paginated(self.urls.module_list)
        reference_layers = []
        for module in modules:
            reference_layers += self._request_paginated(
                self.urls.reference_layer_list(module['uuid'])
            )
        for reference_layer in reference_layers:
            reference_layer['identifier'] = reference_layer['uuid']
        return reference_layers

    def get_reference_layer_detail(self, reference_layer_identifier: str):
        """Return reference layer."""
        url = self.urls.reference_layer_detail(reference_layer_identifier)
        response = self.get(url)
        if response.status_code != 200:
            raise GeorepoRequestError(
                f"Fetching reference layer detail error "
                f"- {response.status_code} - {response.text}"
            )
        return response.json()

    def get_reference_layer_views(self, reference_layer_identifier: str):
        """Return reference layer."""
        url = self.urls.reference_layer_views(reference_layer_identifier)
        response = self.get(url)
        if response.status_code != 200:
            raise GeorepoRequestError(
                f"Fetching reference layer detail error "
                f"- {response.status_code} - {response.text}"
            )
        return response.json()

    def _request_paginated(self, url: str, page: int = 1) -> list:
        """Return list of responses of paginated request."""
        if '?' not in url:
            url_request = f'{url}?page={page}&page_size={self.page_size}'
        else:
            url_request = f'{url}&page={page}&page_size={self.page_size}'
        response = self.get(url_request)
        if response.status_code != 200:
            raise GeorepoRequestError(
                f"Error fetching on {url_request} "
                f"- {response.status_code} - {response.text}"
            )
        result = response.json()
        if result['total_page'] <= page:
            return result['results']
        else:
            return result['results'] + self._request_paginated(url, page + 1)

    # VIEW REQUESTS
    class ViewRequest:
        """Request for views."""

        def __init__(self, request, urls):
            """Init Class."""
            self.urls = urls
            self.request = request

        def get_detail(self, identifier):
            """Return detail of view."""
            try:
                response = self.request.get(self.urls.view_detail(identifier))
                if response.status_code != 200:
                    raise GeorepoRequestError(
                        f"Georepo View "
                        f"- {response.status_code} - {response.text}"
                    )
                return response.json()
            except json.decoder.JSONDecodeError:
                raise GeorepoRequestError(
                    f'Error fetching on {self.urls.view_detail(identifier)} '
                    f'- response is not json'
                )
            except ConnectionError:
                raise GeorepoRequestError(
                    f'Error fetching on {self.urls.view_detail(identifier)} '
                    '- Request Time Out'
                )

        def find_entity(
                self, identifier: str,
                original_id_type: str, original_id: str
        ) -> GeorepoEntity:
            """Return entity by reference layer, original id and it's type."""
            url = self.urls.view_entity_finder(
                identifier, original_id_type, original_id
            )
            try:
                response = self.request.get(url)
            except ConnectionError:
                raise GeorepoRequestError(
                    f'Error fetching on {url} - Request Time Out'
                )
            if response.status_code != 200:
                raise GeorepoRequestError(
                    f'Error fetching on {url} '
                    f'- {response.status_code} - {response.text}'
                )
            result = response.json()
            if len(result['results']) > 1:
                raise MultipleObjectsReturned('Multiple entity returned.')
            else:
                try:
                    return GeorepoEntity(result['results'][0])
                except IndexError:
                    raise GeorepoEntityDoesNotExist()

        def entities(self, identifier, level=None):
            """Return entities by level.

            If it is none, return every entity.
            """
            detail = self.get_detail(identifier)
            if 'dataset_levels' not in detail or not len(
                    detail['dataset_levels']
            ):
                raise GeorepoRequestError(
                    "dataset_levels data is not provided by georepo.")
            entities = []
            for dataset_level in detail['dataset_levels']:
                if level is not None and dataset_level['level'] != level:
                    continue
                entities += GeorepoRequest()._request_paginated(
                    dataset_level['url']
                )
            return entities

        def get_reference_layer_bbox(self, identifier):
            """Return bbox."""
            detail = self.get_detail(identifier)
            if 'dataset_levels' not in detail or not len(
                    detail['dataset_levels']
            ):
                raise GeorepoRequestError(
                    "dataset_levels data is not provided by georepo.")

            # Get list of entity on first level
            first_level = detail['dataset_levels'][0]
            url = first_level['url']
            entities = GeorepoRequest()._request_paginated(url)
            bbox = None
            for entity in entities:
                url = (
                    f"{self.urls.georepo_url}"
                    f"/operation/view/{identifier}"
                    f"/bbox/uuid/{entity['uuid']}/"
                )
                response = self.request.get(url)
                if response.status_code != 200:
                    raise GeorepoRequestError(
                        f"Fetching bbox error "
                        f"- {response.status_code} - {response.text}"
                    )
                response_bbox = response.json()
                if not bbox:
                    bbox = response.json()
                else:
                    bbox = [
                        bbox[0] if bbox[0] < response_bbox[0] else
                        response_bbox[
                            0],
                        bbox[1] if bbox[1] < response_bbox[1] else
                        response_bbox[
                            1],
                        bbox[2] if bbox[2] > response_bbox[2] else
                        response_bbox[
                            2],
                        bbox[3] if bbox[3] > response_bbox[3] else
                        response_bbox[
                            3],
                    ]
            return bbox

        def containment(
                self, reference_layer_identifier: str, spatial_query, distance,
                admin_level, geojson
        ):
            """Return containment for the geojson."""
            url = (
                f"{self.urls.georepo_url}/operation/view/"
                f"{reference_layer_identifier}"
                f"/containment-check/{spatial_query}/"
                f"{distance}/ucode/?admin_level={admin_level}"
            )
            response = self.request.post(url, geojson)
            if response.status_code != 200:
                raise GeorepoRequestError(
                    f"Fetching containment detail error "
                    f"- {response.status_code} - {response.text}"
                )
            response = response.json()
            features = []
            for feature in response['features']:
                properties = feature['properties']
                try:
                    if isinstance(properties['ucode'], list):
                        properties['ucode'] = properties['ucode'][0]
                    features.append(feature)
                except (KeyError, IndexError):
                    pass
            response['features'] = features
            return response
