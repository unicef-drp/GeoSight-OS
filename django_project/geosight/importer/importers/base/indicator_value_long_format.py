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

from abc import ABC
from typing import List

from geosight.data.models.indicator import Indicator
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.importers.base.indicator_value import (
    AbstractImporterIndicatorValue, IndicatorDataType
)
from geosight.importer.utilities import get_data_from_record


class IndicatorValueLongFormat(AbstractImporterIndicatorValue, ABC):
    """Import data long format for indicator value."""

    description = "Import Related Table data from excel in long format."

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return AbstractImporterIndicatorValue.attributes_definition(
            **kwargs) + [
            ImporterAttribute(
                name='indicator_data_type',
                input_type=ImporterAttributeInputType.TEXT,
                options=[
                    IndicatorDataType.BY_VALUE,
                    IndicatorDataType.DATA_DRIVEN
                ]
            ),
            ImporterAttribute(
                name='indicator_data_field',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='indicator_data_value',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),

            ImporterAttribute(
                name='key_value',
                input_type=ImporterAttributeInputType.TEXT
            ),
        ]

    def get_indicator_from_data(self, data: dict, note: dict):
        """Get indicator."""
        indicator_data_type = self.get_attribute('indicator_data_type')
        if indicator_data_type == IndicatorDataType.BY_VALUE:
            indicator_data_value = self.get_attribute('indicator_data_value')
            data.update(
                {'indicator_id': indicator_data_value}
            )
            try:
                return self.get_indicator(data), data, note
            except Indicator.DoesNotExist:
                note.update(
                    {'indicator_id': 'Indicator does not exist'}
                )
                return None, data, note

        elif indicator_data_type == IndicatorDataType.DATA_DRIVEN:
            indicator_data_field = self.get_attribute('indicator_data_field')
            data.update(
                {
                    'indicator_shortcode': get_data_from_record(
                        indicator_data_field, data),
                    'indicator_name': get_data_from_record(
                        indicator_data_field, data)
                }
            )
            try:
                return self.get_indicator(data), data, note
            except Indicator.DoesNotExist:
                note.update(
                    {'indicator_name': 'Indicator does not exist'}
                )
                return None, data, note
        return None, data, note

    def process_data_from_records(self):
        """Run the import process."""
        self._update('Reading data')

        ref_layer_identifier = self.importer.reference_layer.identifier
        records = self.get_records()

        success = True
        total = len(records)
        adm_code_column = self.attributes['key_administration_code']
        value_column = self.get_attribute('key_value')
        code_type = self.importer.admin_code_type

        # Save the geocode that is not exist
        checked_geocode = []
        invalid_check_idx = []

        # Save the clean records
        clean_records = []
        notes = []
        idx = 0

        for line_idx, record in enumerate(records):
            if not record:
                continue

            # Update log
            self._update(
                f'Processing line {line_idx}/{total}',
                progress=int((line_idx / total) * 50)
            )

            # ---------------------------------------
            # Construct data
            # ---------------------------------------
            geo_code = get_data_from_record(adm_code_column, record)
            value = get_data_from_record(value_column, record)

            note = {}
            date_time, date_time_error = self.get_date_time(record)
            indicator, data, note = self.get_indicator_from_data(record, note)
            indicator_id = data.get(
                'indicator_id', indicator.id if indicator else None
            )
            data = {
                'indicator_id': indicator_id,
                'date_time': date_time,
                'geo_code': geo_code,
                'value': value,
                'reference_layer_identifier': ref_layer_identifier,
                'indicator_shortcode': data.get('indicator_shortcode', None),
                'indicator_name': data.get('indicator_name', None),
            }

            if not indicator:
                note['indicator_name'] = 'Indicator does not found'
            if not geo_code:
                note['value'] = 'Administrative code is empty'
            if not date_time:
                note['date_time'] = 'date_time is empty'
            if date_time_error:
                note['date_time'] = date_time_error
            if value is None:
                note['value'] = 'Value is empty'

            # ----------------------------------------
            # Check the geocode
            data[code_type] = data['geo_code']

            # Check admin level
            try:
                admin_level = self.get_admin_level_from_data(record)
                data['admin_level'] = admin_level
            except KeyError:
                note['admin_level'] = 'Admin level is required'
            except ValueError:
                note['admin_level'] = 'Admin level is not integer'

            entity, error = self.get_entity(
                data, self.importer.admin_code_type, auto_fetch=False
            )
            if entity:
                data['geo_code'] = entity.geom_id
                data['admin_level'] = entity.admin_level
            else:
                if error == 'This code does not exist.':
                    checked_geocode.append(data['geo_code'])
                    invalid_check_idx.append(idx)
                else:
                    note[code_type] = error
            # ----------------------------------------

            # Save to clean records
            clean_records.append(data)
            notes.append(note)
            idx += 1

            # If there is note, failed
            if len(note.keys()):
                success = False

        # Checking missing geocode
        if len(checked_geocode):
            results = self.check_codes(codes=checked_geocode)
            for idx in invalid_check_idx:
                try:
                    record = clean_records[idx]
                except IndexError:
                    pass
                else:
                    try:
                        geo_code = record['geo_code']
                        codes = results[geo_code]
                        clean_records[idx]['geo_code'] = codes[len(codes) - 1]
                    except (IndexError, KeyError):
                        notes[idx][code_type] = 'This code does not exist.'
                        success = False

        return clean_records, notes, success
