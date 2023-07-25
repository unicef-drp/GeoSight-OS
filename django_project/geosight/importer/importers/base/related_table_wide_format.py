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
from geosight.importer.importers.base.related_table import (
    AbstractImporterRelatedTable
)


class RelatedTableWideFormat(AbstractImporterRelatedTable):
    """Import data from excel in wide format for related table."""

    description = "Import Related Table data from excel in wide format."

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        return AbstractImporterRelatedTable.attributes_definition(
            **kwargs)

    def _process_data(self):
        """Run the import process."""
        self._update('Reading data')
        records = self.get_records()

        success = True
        total = len(records)
        for line_idx, record in enumerate(records):
            if not record:
                continue

            progress = int((line_idx / total) * 50)

            # Update log
            self._update(
                f'Processing line {line_idx}/{total}',
                progress=progress
            )

            # ---------------------------------------
            # Construct data
            # ---------------------------------------
            data = {}
            for key, value in record.items():
                try:
                    data[key] = value
                    data[key] = float(value)
                except IndexError:
                    data[key] = None
                except (ValueError, TypeError):
                    pass

            # Save data to log
            self._save_data_to_log(data, {})
        return success, None
