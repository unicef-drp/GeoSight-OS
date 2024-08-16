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

import responses


class PatchReqeust:
    """Request object for patch."""

    def __init__(
            self, url: str, response: dict = None, file_response: str = None,
            request_method='GET'
    ):
        """Initialize the PatchReqeust.

        :param url: URL to mock
        :param response: Response to be used as responses.
        :param file_response:
            File to be used as responses. It is json file.
            If response is not provided, file_response will be used instead.
        :param request_method: Type request method.
        """
        self.url = url
        self.response = response
        self.file_response = file_response
        self.request_method = request_method


class BaseTestWithPatchResponses:
    """Base for test patch with responses."""

    mock_requests = []

    def _mock_request(self, patch_request: PatchReqeust):
        """Mock response with file."""

        request_method = patch_request.request_method
        response = patch_request.response
        file_response = patch_request.file_response
        responses.add(
            responses.GET if request_method == 'GET' else responses.POST,
            patch_request.url,
            status=200,
            json=response if response else json.loads(
                open(file_response, "r").read()
            )
        )

    def init_mock_requests(self):
        """Init mock requests."""
        for mock_request in self.mock_requests:
            self._mock_request(mock_request)
