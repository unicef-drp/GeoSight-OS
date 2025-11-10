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
__date__ = '10/11/2025'
__copyright__ = ('Copyright 2025, Unicef')

from django.contrib.gis.db import models

from core.models import AbstractTerm


class SDMXError(Exception):
    """Exception raised for errors in sdmx request."""

    def __init__(self, message="SDMX request error."):
        """Init function."""
        self.message = message
        super().__init__(self.message)


class SDMXConfig(AbstractTerm):
    """SDMX config model."""

    url = models.URLField()

    def full_name(self):
        """Return full name."""
        return f'{self.name} ({self.url})'

    @property
    def urls(self):
        """Return urls."""
        url = self.url
        if not url.endswith("/"):
            url += "/"
        return {
            "agencies": (
                f"{url}agencyscheme/all/all/all?"
                f"format=fusion-json&detail=full&references=none&"
                f"includeMetadata=true&includeAllAnnotations=true"
            ),
            "dataflow": f"{url}dataflow/",
            "dataflow_versions": (
                f"{url}dataflow/<agency>/<dataflow>/all/?format=sdmx-2.1&"
                f"detail=full&references=none"
            ),
            "data_structure": (
                f"{url}datastructure/<agency>/<dataflow>/<dataflow_version>"
            ),
            "data": (
                f"{url}data/<agency>,<dataflow>,<dataflow_version>/<dimensions>"
                f"?format=fusion-json&dimensionAtObservation=AllDimensions"
                f"&detail=structureOnly&includeMetrics=true"
                f"&includeAllAnnotations=true"
            )
        }
