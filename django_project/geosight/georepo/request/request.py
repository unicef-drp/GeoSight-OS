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
import time
from urllib.parse import urlparse

import requests
from django.contrib.auth import get_user_model
from django.core.exceptions import MultipleObjectsReturned
from requests.exceptions import Timeout

from core.models.preferences import SitePreferences
from geosight.georepo.request.data import GeorepoEntity

logger = logging.getLogger(__name__)

User = get_user_model()


class GeorepoUrlDoesNotExist(Exception):
    """Raised when the GeoRepo URL is not configured in site preferences."""

    def __init__(self):
        """Initialise the exception with a descriptive message."""
        message = (
            'Georepo URL is empty. Please add it on site preferences admin.'
        )
        logger.error(message)
        super().__init__(message)


class GeorepoRequestError(Exception):
    """Raised when a GeoRepo HTTP request returns an unexpected response."""

    def __init__(self, message):  # noqa: DOC101, DOC103
        """Initialise the exception, log the error, and store the message.

        :param message: Human-readable description of the error.
        :type message: str
        """
        logger.error(message)
        self.message = message
        super().__init__(self.message)


class GeorepoEntityDoesNotExist(Exception):
    """Raised when an entity lookup returns no results from GeoRepo."""

    def __init__(self):
        """Initialise the exception with a descriptive message."""
        message = 'Georepo entity does not exist.'
        logger.error(message)
        super().__init__(message)


class GeorepoPostPooling:
    """Long-poll helper for asynchronous GeoRepo POST endpoints.

    Submits a POST request, obtains a ``status_url`` from the response,
    then polls that URL until the job reaches ``DONE``, ``ERROR``, or
    ``CANCELLED`` — or until :attr:`LIMIT` retries are exhausted.
    """

    LIMIT = 1500  # Check result maximum 1500 times or 4500 seconds
    INTERVAL = 5  # Interval of check results

    def __init__(  # noqa: DOC101,DOC103,DOC501,DOC503
            self, request, url, data
    ):
        """
        Submit the initial POST request and store the callback URL.

        :param request: An object with ``post`` and ``get`` methods that
            add authentication headers automatically (e.g. a
            :class:`GeorepoRequest` instance).
        :type request: GeorepoRequest
        :param url: The GeoRepo endpoint to POST to.
        :type url: str
        :param data: JSON-serialisable payload to send in the POST body.
        :type data: object
        :raises GeorepoRequestError: If the POST response status is not 200,
            or if the response body does not contain a ``status_url`` key.
        """
        self.request = request
        self.current_repeat = 0

        response = request.post(url, data)
        if response.status_code != 200:
            raise GeorepoRequestError(
                f"Identify codes error "
                f"- {response.status_code} - {response.text}"
            )
        response = response.json()
        try:
            self.callback_url = response['status_url']
        except KeyError:
            raise GeorepoRequestError('Status url is not found.')

    def results(self):
        """
        Poll the callback URL until the job is complete and return the output.

        Recursively retries up to :attr:`LIMIT` times, sleeping
        :attr:`INTERVAL` seconds between attempts.

        :return: The parsed JSON output returned by GeoRepo on completion.
        :rtype: list or dict
        :raises GeorepoRequestError: If the job status is ``ERROR`` or
            ``CANCELLED``, or if the callback URL returns a non-200 status.
        :raises requests.exceptions.Timeout: If :attr:`LIMIT` retries are
            exhausted.
        """
        self.current_repeat += 1
        if self.current_repeat >= self.LIMIT:
            raise requests.exceptions.Timeout()
        try:
            response = self.request.get(self.callback_url)
            if response.status_code != 200:
                raise GeorepoRequestError(
                    f'{response.status_code} - {response.text}'
                )
            response = response.json()
            if response['status'] == 'DONE':
                results = self.request.get(response['output_url'])
                return results.json()
            elif response['status'] in ['ERROR', 'CANCELLED']:
                try:
                    raise GeorepoRequestError(response['error'])
                except KeyError:
                    raise GeorepoRequestError(response['status'])
            else:
                time.sleep(self.INTERVAL)
                return self.results()
        except requests.exceptions.Timeout:
            time.sleep(self.INTERVAL)
            return self.results()


class GeorepoUrl:
    """URL builder for GeoRepo API endpoints.

    Reads the GeoRepo base URL and API credentials from
    :class:`~core.models.preferences.SitePreferences` and exposes helper
    properties / methods that return fully-formed endpoint URLs.
    """

    api_key_is_public = False

    def __init__(  # noqa: DOC101,DOC103
            self, api_key: str = None, api_key_email: str = None
    ):
        """
        Initialise the URL builder with optional credential overrides.

        If ``api_key`` is not provided the credentials are read from
        :class:`~core.models.preferences.SitePreferences` according to the
        ``georepo_using_user_api_key`` flag.

        :param api_key: GeoRepo API token to use instead of the site default.
        :type api_key: str
        :param api_key_email: E-mail associated with ``api_key``.
        :type api_key_email: str
        """
        pref = SitePreferences.preferences()
        if pref.georepo_url:
            self.georepo_url = pref.georepo_url.strip('/')
        else:
            self.georepo_url = ''
        parsed = urlparse(self.georepo_url)
        self.georepo_domain = parsed.scheme + '://' + parsed.netloc

        # Provide api based on default or api_key
        self.georepo_api_key = api_key
        self.georepo_api_key_email = api_key_email
        if not self.georepo_api_key:
            if pref.georepo_using_user_api_key:
                self.georepo_api_key = pref.georepo_api_key_level_1_val
                self.georepo_api_key_email = pref.georepo_api_key_level_1_email
            else:
                self.georepo_api_key = pref.georepo_api_key_level_4_val
                self.georepo_api_key_email = pref.georepo_api_key_level_4_email

        if self.georepo_api_key == pref.georepo_api_key_level_4_val:
            self.api_key_is_public = False
        elif self.georepo_api_key == pref.georepo_api_key_level_1_val:
            self.api_key_is_public = True

        self.headers = {
            'Authorization': f'Token {self.georepo_api_key}',
            'GeoRepo-User-Key': self.georepo_api_key_email
        }

    @property
    def module_list(self) -> str:
        """
        Return the API URL for listing GeoRepo modules.

        :return: Fully-formed module list endpoint URL.
        :rtype: str
        """
        return (
            f'{self.georepo_url}/search/module/list/'
            f'?cached=False'
        )

    def reference_layer_list(self, module_uuid: str) -> str:
        """
        Return the API URL for listing datasets within a module.

        :param module_uuid: UUID of the GeoRepo module.
        :type module_uuid: str
        :return: Fully-formed dataset list endpoint URL.
        :rtype: str
        """
        return (
            f'{self.georepo_url}/search/module/{module_uuid}/dataset/list/'
            f'?cached=False'
        )

    def reference_layer_detail(self, reference_layer_uuid) -> str:
        """
        Return the API URL for a single dataset detail.

        :param reference_layer_uuid: UUID (identifier) of the dataset.
        :type reference_layer_uuid: str
        :return: Fully-formed dataset detail endpoint URL.
        :rtype: str
        """
        return (
            f'{self.georepo_url}/search/dataset/{reference_layer_uuid}'
            f'?cached=False'
        )

    def reference_layer_views(self, reference_layer_uuid) -> str:
        """
        Return the API URL for listing views of a dataset.

        :param reference_layer_uuid: UUID (identifier) of the dataset.
        :type reference_layer_uuid: str
        :return: Fully-formed view list endpoint URL.
        :rtype: str
        """
        return (
            f'{self.georepo_url}/search/dataset/{reference_layer_uuid}'
            f'/view/list?cached=False'
        )

    def entity_finder(self, reference_layer_uuid, id_type, id) -> str:
        """
        Return the API URL for finding an entity within a dataset by ID.

        :param reference_layer_uuid: UUID of the dataset to search within.
        :type reference_layer_uuid: str
        :param id_type: Identifier type (e.g. ``'ucode'``, ``'PCode'``).
        :type id_type: str
        :param id: The identifier value to look up.
        :type id: str
        :return: Fully-formed entity finder endpoint URL.
        :rtype: str
        """
        return (
            f'{self.georepo_url}/search/dataset/{reference_layer_uuid}'
            f'/entity/identifier/{id_type}/{id}/'
            f'?cached=False'
        )

    @property
    def details(self) -> dict:
        """
        Return a dictionary of API connection details for client consumption.

        :return: Dictionary containing domain, API base URL, example endpoint
            URLs, authentication headers, and API key metadata.
        :rtype: dict
        """
        pref = SitePreferences.preferences()
        return {
            'domain': self.georepo_domain,
            'api': self.georepo_url,
            'reference_layer_detail': self.reference_layer_detail(
                '<identifier>'
            ),
            'headers': self.headers,
            'public_headers': {
                'Authorization': f'Token {pref.georepo_api_key_level_1_val}',
                'GeoRepo-User-Key': pref.georepo_api_key_level_1_email
            },
            'view_detail': self.view_detail('<identifier>'),
            'api_key': self.georepo_api_key,
            'api_key_email': self.georepo_api_key_email,
            'api_key_is_public': self.api_key_is_public,
            'api_key_public': {
                'api_key': pref.georepo_api_key_level_1_val,
                'email': pref.georepo_api_key_level_1_email
            }
        }

    # -------------------------------------------
    # VIEWS
    # -------------------------------------------
    def view_detail(self, view_uuid):
        """
        Return the API URL for a single view's detail.

        :param view_uuid: UUID of the GeoRepo view.
        :type view_uuid: str
        :return: Fully-formed view detail endpoint URL.
        :rtype: str
        """
        return (
            f'{self.georepo_url}/search/view/{view_uuid}/'
            f'?cached=False'
        )

    def view_entity_finder(self, view_uuid, id_type, id) -> str:
        """
        Return the API URL for finding an entity within a view by ID.

        :param view_uuid: UUID of the GeoRepo view.
        :type view_uuid: str
        :param id_type: Identifier type (e.g. ``'ucode'``, ``'PCode'``).
        :type id_type: str
        :param id: The identifier value to look up.
        :type id: str
        :return: Fully-formed view entity finder endpoint URL.
        :rtype: str
        """
        return (
            f'{self.georepo_url}/search/view/{view_uuid}'
            f'/entity/identifier/{id_type}/{id}/'
            f'?cached=False'
        )


class GeorepoRequest:
    """High-level client for the GeoRepo REST API.

    Wraps authenticated HTTP requests and exposes methods for common
    operations such as listing reference layers and resolving entity codes.
    Pagination is handled transparently by :meth:`_request_paginated`.
    """

    page_size = 200

    def __init__(self):
        """Initialise using level-4 credentials from SitePreferences."""
        pref = SitePreferences.preferences()
        self.urls = GeorepoUrl(
            api_key=pref.georepo_api_key_level_4_val,
            api_key_email=pref.georepo_api_key_level_4_email
        )
        self.View = self.ViewRequest(self, self.urls)

    def get(self, url):
        """
        Perform an authenticated GET request.

        :param url: Full URL to request.
        :type url: str
        :return: The HTTP response object.
        :rtype: requests.Response
        """
        return requests.get(url, headers=self.urls.headers)

    def post(self, url, data: json):
        """
        Perform an authenticated POST request with a JSON body.

        :param url: Full URL to POST to.
        :type url: str
        :param data: JSON-serialisable payload.
        :type data: object
        :return: The HTTP response object.
        :rtype: requests.Response
        """
        return requests.post(url, json=data, headers=self.urls.headers)

    def get_reference_layer_list(self):
        """
        Return a flat list of all reference layer datasets across all modules.

        Iterates every GeoRepo module and collects their datasets. Each
        dataset dict is augmented with an ``'identifier'`` key equal to
        its ``'uuid'``.

        :return: List of dataset dicts returned by GeoRepo.
        :rtype: list[dict]
        """
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
        """
        Return the detail dict for a single reference layer dataset.

        :param reference_layer_identifier: UUID / identifier of the dataset.
        :type reference_layer_identifier: str
        :return: Parsed JSON response from GeoRepo.
        :rtype: dict
        :raises GeorepoRequestError: If the response status is not 200.
        """
        url = self.urls.reference_layer_detail(reference_layer_identifier)
        response = self.get(url)
        if response.status_code != 200:
            raise GeorepoRequestError(
                f"Fetching reference layer detail error "
                f"- {response.status_code} - {response.text}"
            )
        return response.json()

    def get_reference_layer_views(self, reference_layer_identifier: str):
        """
        Return a list of all views for a reference layer dataset.

        :param reference_layer_identifier: UUID / identifier of the dataset.
        :type reference_layer_identifier: str
        :return: List of view dicts returned by GeoRepo.
        :rtype: list[dict]
        """
        url = self.urls.reference_layer_views(reference_layer_identifier)
        return self._request_paginated(url)

    def _request_paginated(self, url: str, page: int = 1) -> list:
        """
        Fetch all pages of a paginated GeoRepo endpoint and return the results.

        :param url: Base endpoint URL (with or without existing query params).
        :type url: str
        :param page: Page number to fetch (1-based). Used internally for
            recursion.
        :type page: int
        :return: Aggregated list of result dicts across all pages.
        :rtype: list[dict]
        :raises GeorepoRequestError: If the response status is not 200.
        """
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
        """Namespace for GeoRepo view-scoped requests."""

        def __init__(self, request, urls):  # noqa: DOC101,DOC103
            """
            Initialise with a parent request client and URL builder.

            :param request: Parent :class:`GeorepoRequest` instance used to
                make authenticated HTTP calls.
            :type request: GeorepoRequest
            :param urls: :class:`GeorepoUrl` instance used to construct
                endpoint URLs.
            :type urls: GeorepoUrl
            """
            self.urls = urls
            self.request = request

        def get_detail(self, identifier):
            """
            Return the detail dict for a GeoRepo view.

            :param identifier: UUID of the view.
            :type identifier: str
            :return: Parsed JSON response from GeoRepo.
            :rtype: dict
            :raises GeorepoRequestError: If the response is not 200, is not
                valid JSON, or the request times out.
            """
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
            except Timeout:
                raise GeorepoRequestError(
                    f'Error fetching on {self.urls.view_detail(identifier)} '
                    '- Request Time Out'
                )

        def find_entity(
                self, identifier: str,
                original_id_type: str, original_id: str
        ) -> GeorepoEntity:
            """
            Look up a single entity within a view by its original identifier.

            :param identifier: UUID of the GeoRepo view to search within.
            :type identifier: str
            :param original_id_type: Identifier type
                (e.g. ``'PCode'``, ``'ucode'``).
            :type original_id_type: str
            :param original_id: The identifier value to look up.
            :type original_id: str
            :return: The matching entity wrapped in a
                :class:`~geosight.georepo.request.data.GeorepoEntity`.
            :rtype: GeorepoEntity
            :raises GeorepoRequestError: If the request times out or the
                response is not 200.
            :raises MultipleObjectsReturned: If more than one entity matches.
            :raises GeorepoEntityDoesNotExist: If no entity matches.
            """
            url = self.urls.view_entity_finder(
                identifier, original_id_type, original_id
            )
            try:
                response = self.request.get(url)
            except Timeout:
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
            """
            Return all entities for a view, optionally filtered by admin level.

            :param identifier: UUID of the GeoRepo view.
            :type identifier: str
            :param level: Admin level to filter by. If ``None``, entities from
                all levels are returned.
            :type level: int, optional
            :return: List of entity dicts returned by GeoRepo.
            :rtype: list[dict]
            :raises GeorepoRequestError: If the view detail is missing
                ``dataset_levels`` or any paginated request fails.
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
            """
            Return the bounding box that covers all entities in the first.

            Fetches the first admin level's entities and unions their
            individual bounding boxes into a single
            ``[minX, minY, maxX, maxY]`` list.

            :param identifier: UUID of the GeoRepo view.
            :type identifier: str
            :return: Bounding box as ``[minX, minY, maxX, maxY]``.
            :rtype: list[float]
            :raises GeorepoRequestError: If the view detail is missing
                ``dataset_levels``, or any individual bbox request fails.
            """
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
            """
            Return a containment-check result for a GeoJSON geometry.

            Sends the GeoJSON to GeoRepo's containment endpoint and filters
            the returned features to those with a valid ``ucode`` property.

            :param reference_layer_identifier: UUID of the GeoRepo view.
            :type reference_layer_identifier: str
            :param spatial_query: Spatial relationship type
                (e.g. ``'Within'``, ``'Intersects'``).
            :type spatial_query: str
            :param distance: Buffer distance for the spatial query.
            :type distance: float
            :param admin_level: Administrative level to query against.
            :type admin_level: int
            :param geojson: GeoJSON geometry or feature to check containment
                for.
            :type geojson: dict
            :return: GeoJSON FeatureCollection with matched features.
            :rtype: dict
            :raises GeorepoRequestError: If the response status is not 200.
            """
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

        def identify_codes(
                self, reference_layer_identifier: str, codes: list,
                original_id_type: str, return_id_type: str
        ):
            """
            Batch-resolve a list of codes to their GeoRepo ucodes.

            Uses the asynchronous POST pooling endpoint; blocks until the job
            is complete.

            :param reference_layer_identifier: UUID of the GeoRepo view.
            :type reference_layer_identifier: str
            :param codes: List of identifier values to resolve.
            :type codes: list
            :param original_id_type: Identifier type of the input codes
                (e.g. ``'PCode'``).
            :type original_id_type: str
            :param return_id_type: Identifier type to return
                (e.g. ``'ucode'``).
            :type return_id_type: str
            :return: Resolved results returned by GeoRepo.
            :rtype: list or dict
            :raises GeorepoRequestError: If the batch request or polling fails.
            """
            url = (
                f"{self.urls.georepo_url}/search/view/"
                f"{reference_layer_identifier}/"
                f"entity/batch/identifier/{original_id_type}/"
            )
            try:
                return GeorepoPostPooling(self.request, url, codes).results()
            except GeorepoRequestError as e:
                raise GeorepoRequestError(
                    f'Error when identifying codes - {e}'
                )
