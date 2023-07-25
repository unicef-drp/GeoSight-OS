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

from typing import List

from geosight.importer.attribute import ImporterAttribute
from geosight.importer.importers.base import RelatedTableWideFormat
from ._base import BaseAPIImporter


class RelatedTableApiWideFormat(
    BaseAPIImporter, RelatedTableWideFormat
):
    """Import data from excel in wide format for related table."""

    description = "Import Related Table data from excel in wide format."

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        return BaseAPIImporter.attributes_definition(
            **kwargs) + RelatedTableWideFormat.attributes_definition(
            **kwargs)
