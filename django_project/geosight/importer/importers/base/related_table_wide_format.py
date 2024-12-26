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

from datetime import datetime, time, date
from typing import List

import pytz
from django.conf import settings

from geosight.data.models.related_table import RelatedTable, RelatedTableRow
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.importers.base.related_table import (
    AbstractImporterRelatedTable
)
from geosight.importer.models.attribute import (
    ImporterAttribute as ImporterAttributeModel
)
from geosight.permission.models.manager import PermissionException


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

        # -----------------------------------------
        # Check related table
        name = self.get_attribute('related_table_name')
        related_table_uuid = self.get_attribute('related_table_uuid')
        try:
            name = name if name else self.importer.__str__()
            related_table, _ = RelatedTable.permissions.get_or_create(
                user=self.importer.creator,
                unique_id=related_table_uuid,
                defaults={
                    'name': name
                }
            )
            related_table.relatedtablerow_set.all().delete()
            related_table.name = name
            related_table.save()
        except PermissionException:
            raise ImporterError(
                "Your ROLE needs to be creator to create new related table"
            )

        # Add related_table_id and related_table_uuid attributes
        ImporterAttributeModel.objects.get_or_create(
            importer=self.importer,
            name='related_table_id',
            value=str(related_table.id)
        )
        ImporterAttributeModel.objects.get_or_create(
            importer=self.importer,
            name='related_table_uuid',
            value=str(related_table.unique_id)
        )
        # -----------------------------------------

        success = True
        total = len(records)
        last_progress = 0
        rows = []
        order = 0
        for line_idx, record in enumerate(records):
            if not record:
                continue

            progress = int((line_idx / total) * 100)

            if progress != last_progress:
                # Update log
                self._update(
                    f'Prepare data {line_idx}/{total}',
                    progress=progress
                )

            # ---------------------------------------
            # Construct data
            # ---------------------------------------
            data = {}
            for key, value in record.items():
                if value.__class__ is str:
                    try:
                        value = float(value)
                        if value.is_integer():
                            value = int(value)
                    except (ValueError, TypeError):
                        pass

                if value.__class__ is date:
                    value = datetime.combine(value, datetime.min.time())
                if value.__class__ is time:
                    value = str(value)
                elif value.__class__ is datetime:
                    value = value.replace(
                        tzinfo=pytz.timezone(settings.TIME_ZONE))
                    value = value.timestamp()

                if value is None:
                    value = ''
                data[key] = value

            # Prepare data
            order += 1
            rows.append(
                RelatedTableRow(
                    table=related_table,
                    order=order,
                    data=data
                )
            )

        self._update('Save to database', progress=100)
        RelatedTableRow.objects.bulk_create(rows)

        # Check relation for other place
        related_table.set_fields()
        related_table.check_relation()
        related_table.increase_version()
        return success, None
