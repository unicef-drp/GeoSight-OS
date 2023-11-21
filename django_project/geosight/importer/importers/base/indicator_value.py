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

import copy
from abc import ABC
from datetime import datetime, date
from typing import List

from django.core.exceptions import ValidationError
from requests.exceptions import Timeout

from core.utils import string_is_true
from geosight.data.models.indicator import (
    Indicator, IndicatorValueRejectedError
)
from geosight.data.models.indicator.indicator_type import (
    IndicatorType
)
from geosight.data.utils import extract_time_string
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.importers.query_data import QueryDataImporter
from geosight.importer.models.log import ImporterLogData
from geosight.importer.utilities import get_data_from_record
from ._base import BaseImporter


class ImporterTimeDataType(object):
    """A quick couple of variable and time data type."""

    NOW = 'Now'
    BY_VALUE = 'By Value'
    DATA_DRIVEN = 'Data Driven'


class IndicatorDataType(object):
    """A quick couple of variable and indicator data type."""

    BY_VALUE = 'By Value'
    DATA_DRIVEN = 'Data Driven'


class AdminLevelType(object):
    """A quick couple of variable and admin level data type."""

    BY_VALUE = 'Specific Level'
    ANY_LEVEL = 'Any Level (Data Driven)'
    DATA_DRIVEN = 'Data Driven'


class MultipleValueAggregationType(object):
    """A quick couple of variable and multiple value aggregation type."""

    BY_INDICATOR = 'Use aggregation from indicator'
    DEFAULT = 'Default Aggregations'


class AbstractImporterIndicatorValue(BaseImporter, QueryDataImporter, ABC):
    """Abstract class for importer of indicator value."""

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return [
            ImporterAttribute(
                name='key_administration_code',
                input_type=ImporterAttributeInputType.TEXT
            ),
            ImporterAttribute(
                name='date_time_data_type',
                input_type=ImporterAttributeInputType.TEXT,
                options=[
                    ImporterTimeDataType.NOW,
                    ImporterTimeDataType.BY_VALUE,
                    ImporterTimeDataType.DATA_DRIVEN
                ]
            ),
            ImporterAttribute(
                name='date_time_data_value',
                input_type=ImporterAttributeInputType.DATE,
                required=False
            ),
            ImporterAttribute(
                name='date_time_data_field',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='date_time_data_format',
                input_type=ImporterAttributeInputType.TEXT,
                required=False,
                default_value='timestamp'
            ),
            ImporterAttribute(
                name='date_data_field',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='time_data_field',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),

            # Admin level
            ImporterAttribute(
                name='admin_level_type',
                input_type=ImporterAttributeInputType.TEXT,
                options=[
                    AdminLevelType.BY_VALUE,
                    AdminLevelType.DATA_DRIVEN,
                    AdminLevelType.ANY_LEVEL,
                ]
            ),
            ImporterAttribute(
                name='admin_level_field',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='admin_level_value',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),

            # Multiple value aggregations
            ImporterAttribute(
                name='aggregate_multiple_value',
                input_type=ImporterAttributeInputType.BOOLEAN,
                default_value=False
            ),
            ImporterAttribute(
                name='aggregate_multiple_value_type',
                input_type=ImporterAttributeInputType.TEXT,
                required=False,
                options=[
                    MultipleValueAggregationType.BY_INDICATOR,
                    MultipleValueAggregationType.DEFAULT
                ]
            ),
            ImporterAttribute(
                name='aggregate_multiple_value_number',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='aggregate_multiple_value_string',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),

            # Upper level value aggregations
            ImporterAttribute(
                name='aggregate_upper_level_type',
                input_type=ImporterAttributeInputType.TEXT,
                required=False,
                options=[
                    MultipleValueAggregationType.BY_INDICATOR,
                    MultipleValueAggregationType.DEFAULT
                ]
            ),
            ImporterAttribute(
                name='aggregate_upper_level_number',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='aggregate_upper_level_string',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='aggregate_upper_level_up_to',
                input_type=ImporterAttributeInputType.NUMBER,
                required=False
            ),
            ImporterAttribute(
                name='aggregate_upper_level_n_level_up',
                input_type=ImporterAttributeInputType.NUMBER,
                required=False
            ),
        ]

    def check_attributes(self):
        """Check attributes definition."""
        super().check_attributes()
        date_time_data_type = self.get_attribute('date_time_data_type')
        if date_time_data_type == ImporterTimeDataType.BY_VALUE:
            if not self.get_attribute('date_time_data_value'):
                raise ImporterError('date_time_data_value is needed')
        elif date_time_data_type == ImporterTimeDataType.DATA_DRIVEN:
            if not self.get_attribute('date_time_data_field'):
                if not self.get_attribute('date_data_field') \
                        and not self.get_attribute('time_data_field'):
                    raise ImporterError('Date information is not provided')

    def get_date_time(self, data):
        """Return date of data."""
        date_time = None
        date_time_value = None
        try:
            date_time_data_type = self.get_attribute('date_time_data_type')
            if date_time_data_type == ImporterTimeDataType.BY_VALUE:
                date_time = self.get_attribute('date_time_data_value')
                date_time_value = date_time
            elif date_time_data_type == ImporterTimeDataType.DATA_DRIVEN:
                date_time_key = self.get_attribute('date_time_data_field')
                if not date_time_key:
                    raise ImporterError('Date time column/field is required')
                # If key is presented
                if date_time_key:
                    try:
                        date_time_value = get_data_from_record(
                            date_time_key, data
                        )
                    except KeyError:
                        raise ImporterError(f'{date_time_key} is not found')

                    # If the value is not datetime or date format
                    date_time_data_format = self.get_attribute(
                        'date_time_data_format')
                    try:
                        date_time = extract_time_string(
                            format_time=date_time_data_format,
                            value=date_time_value
                        )
                    except ValueError as e:
                        raise ImporterError(e)
                    except TypeError:
                        raise ImporterError(
                            f'Date is int, but date format is '
                            f'{date_time_data_format}'
                        )
            else:
                date_time = self.now_time

            if date_time.__class__ in [date]:
                date_time = datetime.combine(
                    date_time, datetime.min.time()
                )
        except ImporterError as e:
            return date_time_value, f'{e}'
        return date_time, None

    def get_admin_level_from_data(self, data: dict):
        """Get admin level."""
        admin_level_type = self.get_attribute('admin_level_type')
        if admin_level_type == AdminLevelType.BY_VALUE:
            return int(self.attributes['admin_level_value'])
        elif admin_level_type == AdminLevelType.DATA_DRIVEN:
            admin_level_field = self.get_attribute('admin_level_field')
            return int(get_data_from_record(admin_level_field, data))
        elif admin_level_type == AdminLevelType.ANY_LEVEL:
            return None
        return None

    def get_indicator_by_id(self, _id: int) -> Indicator:
        """Return indicator."""
        try:
            return self.objects[_id]
        except KeyError:
            self.objects[_id] = Indicator.objects.get(id=_id)
            return self.objects[_id]

    def get_indicator_by_shortcode(self, shortcode: str) -> Indicator:
        """Return indicator."""
        try:
            return self.objects[shortcode]
        except KeyError:
            self.objects[shortcode] = Indicator.objects.get(
                shortcode=shortcode
            )
            return self.objects[shortcode]

    def get_indicator(self, data: dict) -> Indicator:
        """Get indicator."""
        indicator = None
        if data.get('indicator_id', None):
            indicator = self.get_indicator_by_id(data['indicator_id'])
        elif data.get('indicator_shortcode', None):
            indicator = self.get_indicator_by_shortcode(
                data['indicator_shortcode']
            )
        if indicator:
            data['indicator_id'] = indicator.id
            data['indicator_shortcode'] = indicator.shortcode
            data['indicator_name'] = indicator.__str__()
        return indicator

    def check_indicator_and_data(self, data: dict):
        """Check indicator and data."""
        indicator = self.get_indicator(data)
        if indicator:
            indicator.validate(data['value'])
        return indicator

    def get_entity(
            self, data, original_id_type: str, auto_fetch: bool = True
    ):
        """Get entity of data."""
        from geosight.georepo.models.entity import Entity
        from geosight.georepo.request import (
            GeorepoEntityDoesNotExist, MultipleObjectsReturned,
            GeorepoRequestError
        )
        adm_code = data['geo_code']
        admin_level = data['admin_level']
        try:
            entity = Entity.get_entity(
                reference_layer=self.importer.reference_layer,
                original_id_type=original_id_type,
                original_id=adm_code,
                admin_level=admin_level,
                date_time=data['date_time'],
                auto_fetch=auto_fetch
            )
            return entity, None
        except GeorepoEntityDoesNotExist:
            return None, 'This code does not exist.'
        except MultipleObjectsReturned:
            return None, 'Found multiple entities for this code.'
        except GeorepoRequestError as e:
            return None, f'{e}'
        except ValidationError:
            return None, 'This code does not exist because of error time.'

    def check_codes(self, codes: list):
        """Check codes to georepo."""
        from geosight.georepo.request import GeorepoRequest
        importer = self.importer
        self._update('Identifying codes from GeoRepo')
        try:
            results = GeorepoRequest().View.identify_codes(
                reference_layer_identifier=importer.reference_layer.identifier,
                original_id_type=importer.admin_code_type,
                codes=codes,
                return_id_type='ucode'

            )
            self._update('Saving codes to Cache')
            return results
        except Timeout:
            raise ImporterError('Identifying codes from GeoRepo is timeout.')

    def _check_data_to_log(self, data: dict, note: dict) -> (dict, dict):
        """Save data that constructed from importer.

        :type data: dict
        :param data: Data that will be saved

        :type note: dict
        :param note: Note for each data

        :rtype (data, note): (dict, dict)
        """
        try:
            data['date_time'] = datetime.timestamp(data['date_time'])
        except (KeyError, ValueError, TypeError):
            pass
        return data, note

    def _save_log_data_to_model(self, log_data: ImporterLogData):
        """Save data from log to actual model."""
        # If there is note, don't save
        if log_data.status not in ['Review', 'Warning']:
            return

        # Delete unnecessary data
        data = log_data.data
        indicator = self.get_indicator(data)
        if indicator:
            reference_layer = None
            if data.get('reference_layer_identifier', None):
                reference_layer = ReferenceLayerView.objects.get(
                    identifier=data['reference_layer_identifier']
                )

            extras = {}
            for key, value in data.items():
                if key in [
                    'ucode', 'value', 'geo_code', 'admin_level', 'date_time',
                    'indicator_id', 'indicator_name', 'indicator_shortcode',
                    'reference_layer_identifier'
                ]:
                    continue
                extras[key] = value

            indicator.save_value(
                datetime.fromtimestamp(data['date_time']),
                data['geo_code'],
                data['value'], reference_layer, data['admin_level'],
                extras=extras
            )
            log_data.saved = True
            log_data.save()

    def process_data_from_records(self) -> (List, bool):
        """Process data from records.

        Returning clean records, is_success
        """
        raise NotImplemented()

    def group_records_by_indicator(self, records):
        """Group record by indicator."""
        records_by_indicator = {}
        for record in records:
            indicator_id = record['indicator_id']
            if indicator_id not in records_by_indicator:
                records_by_indicator[indicator_id] = []
            record['date_time'] = int(
                datetime.timestamp(record['date_time'])
            )
            records_by_indicator[indicator_id].append(record)
        return records_by_indicator

    def get_parents_records(self, record, entity: Entity):
        """Return parents from record."""
        aggregate_upper_level_up_to = self.get_attribute(
            'aggregate_upper_level_up_to'
        )
        aggregate_upper_level_n_level_up = self.get_attribute(
            'aggregate_upper_level_n_level_up'
        )
        upper_level_count = 0
        admin_level = entity.admin_level
        if aggregate_upper_level_up_to is not None:
            aggregate_upper_level_up_to = int(aggregate_upper_level_up_to)
            upper_level_count = admin_level - aggregate_upper_level_up_to
        if aggregate_upper_level_n_level_up is not None:
            aggregate_upper_level_n_level_up = int(
                aggregate_upper_level_n_level_up
            )
            upper_level_count = aggregate_upper_level_n_level_up

        if upper_level_count <= 0:
            return []
        if not entity.parents:
            return []

        # Create record for upper level
        records = []
        for idx, geocode in enumerate(entity.parents[:upper_level_count]):
            record = copy.deepcopy(record)
            record['geo_code'] = geocode
            record['admin_level'] = admin_level - (idx + 1)
            records.append(record)
        return records

    def get_indicator_fields(self, indicator):
        """Return indicator fields."""
        default_fields = [
            {'name': 'indicator_id', 'type': 'INTEGER'},
            {'name': 'date_time', 'type': 'NUMBER'},
            {'name': 'geo_code', 'type': 'VARCHAR'},
            {'name': 'reference_layer_identifier', 'type': 'VARCHAR'},
            {'name': 'admin_level', 'type': 'INTEGER'}
        ]
        fields = copy.deepcopy(default_fields)

        # Get the fields
        if indicator.type == IndicatorType.STRING:
            fields.append({'name': 'value', 'type': 'VARCHAR'})
        elif indicator.type == IndicatorType.INTEGER:
            fields.append({'name': 'value', 'type': 'INTEGER'})
        else:
            fields.append(
                {'name': 'value', 'type': 'DOUBLE PRECISION'}
            )
        return fields

    def _process_data(self):
        """Run the harvester process."""
        records, notes, success = self.process_data_from_records()

        # --------------------------------------------------
        # If success we do aggregation
        additional_notes = []
        if success:
            # --------------------------------------------------
            # AGGREGATION MULTIPLE VALUES
            # --------------------------------------------------
            aggregate_multiple_value = string_is_true(
                self.get_attribute('aggregate_multiple_value')
            )
            if aggregate_multiple_value is True:
                self._update(
                    'Aggregate the multiple value', progress=50
                )

                # If it is default one
                aggregate_type = self.get_attribute(
                    'aggregate_multiple_value_type'
                )
                aggregate_multiple_value_number = self.get_attribute(
                    'aggregate_multiple_value_number'
                )
                aggregate_multiple_value_string = self.get_attribute(
                    'aggregate_multiple_value_string'
                )
                aggregated_records = []

                # Group records by indicator_id
                records_by_indicator = self.group_records_by_indicator(records)
                for indicator_id, _records in records_by_indicator.items():
                    indicator = self.get_indicator(
                        {'indicator_id': indicator_id}
                    )
                    aggregation = None

                    # Get Aggregation
                    if aggregate_type == \
                            MultipleValueAggregationType.BY_INDICATOR:
                        aggregation = indicator.aggregation_multiple_values
                    elif indicator.type == IndicatorType.STRING:
                        if not aggregate_multiple_value_string:
                            raise ImporterError(
                                'aggregate_multiple_value_string is empty'
                            )
                        aggregation = aggregate_multiple_value_string
                    elif indicator.type != IndicatorType.STRING:
                        if not aggregate_multiple_value_number:
                            raise ImporterError(
                                'aggregate_multiple_value_string is empty'
                            )
                        aggregation = aggregate_multiple_value_number

                    aggregated_records += self.querying_data(
                        data=_records,
                        fields=self.get_indicator_fields(indicator),
                        group_field=(
                            'indicator_id,date_time,geo_code,admin_level,'
                            'reference_layer_identifier'
                        ),
                        aggregation=aggregation
                    )
                records = aggregated_records
                for record in records:
                    record['date_time'] = datetime.fromtimestamp(
                        record['date_time']
                    )
                    try:
                        record['description'] += ' (from multiple values)'
                    except KeyError:
                        pass

            # --------------------------------------------------
            # AGGREGATION UPPER LEVEL
            # Group records by indicator_id
            # --------------------------------------------------
            aggregate_upper_level_up_to = self.get_attribute(
                'aggregate_upper_level_up_to'
            )
            aggregate_upper_level_n_level_up = self.get_attribute(
                'aggregate_upper_level_n_level_up'
            )
            aggregate_upper_level = (
                    aggregate_upper_level_up_to is not None or
                    aggregate_upper_level_n_level_up is not None
            )
            if aggregate_upper_level:
                records_by_indicator = self.group_records_by_indicator(records)
                for indicator_id, _records in records_by_indicator.items():
                    indicator = self.get_indicator(
                        {'indicator_id': indicator_id}
                    )
                    if not indicator.aggregation_upper_level_allowed:
                        additional_notes.append(
                            f'Indicator {indicator.name} '
                            f'does not allow aggregating upper levels.'
                        )
                        continue

                    upper_level_records = []
                    for record in _records:
                        # We need to check the geography code
                        entity, error = self.get_entity(record, 'ucode')
                        if not entity:
                            additional_notes.append(
                                f'ucode for {record["geo_code"]} - {error}'
                            )
                            upper_level_records = []
                            success = False
                            continue

                        parents_records = self.get_parents_records(
                            record, entity
                        )
                        for _pr in parents_records:
                            exist = False
                            for idx, _r in enumerate(records):
                                if _r['indicator_id'] == _pr[
                                    'indicator_id'] and \
                                        _r['date_time'] == _pr['date_time'] \
                                        and _r['geo_code'] == _pr['geo_code']:
                                    exist = True
                                    warning = (
                                        'Conflict between generated one and '
                                        'source data. It is using source data'
                                    )
                                    notes[idx].update({'warning': warning})
                                    break
                            if not exist:
                                upper_level_records += [_pr]

                    if not upper_level_records:
                        continue

                    # Aggregate it
                    aggregate_type = self.get_attribute(
                        'aggregate_upper_level_type'
                    )
                    aggregate_multiple_value_number = self.get_attribute(
                        'aggregate_upper_level_number'
                    )
                    aggregate_multiple_value_string = self.get_attribute(
                        'aggregate_upper_level_string'
                    )
                    aggregation = None
                    # Get Aggregation
                    if aggregate_type == \
                            MultipleValueAggregationType.BY_INDICATOR:
                        aggregation = indicator.aggregation_upper_level
                    elif indicator.type == IndicatorType.STRING:
                        if not aggregate_multiple_value_string:
                            raise ImporterError(
                                'aggregate_upper_level__string is empty'
                            )
                        aggregation = aggregate_multiple_value_string
                    elif indicator.type != IndicatorType.STRING:
                        if not aggregate_multiple_value_number:
                            raise ImporterError(
                                'aggregate_upper_level_string is empty'
                            )
                        aggregation = aggregate_multiple_value_number

                    upper_level_records = self.querying_data(
                        data=upper_level_records,
                        fields=self.get_indicator_fields(indicator),
                        group_field=(
                            'indicator_id,date_time,geo_code,admin_level,'
                            'reference_layer_identifier'
                        ),
                        aggregation=aggregation
                    )
                    for record in upper_level_records:
                        record['date_time'] = datetime.fromtimestamp(
                            record['date_time']
                        )
                        record['date_time'] = int(
                            datetime.timestamp(record['date_time'])
                        )
                        try:
                            record['description'] += (
                                f" (from level {record['admin_level'] + 1})"
                            )
                        except KeyError:
                            pass
                    records += upper_level_records

        # --------------------------------------------------
        # SAVE THE DATA
        # --------------------------------------------------
        # Calculate warning data
        warning_data = 0
        for note in notes:
            if 'warning' in note:
                warning_data += 1
        if warning_data:
            additional_notes.append(
                f'<div class="warning">'
                f'There are {warning_data} warning(s)'
                f'</div>'
            )

        total = len(records)
        for line_idx, record in enumerate(records):
            self._update(
                f'Save the data to be reviewed {line_idx}/{total}',
                progress=int((line_idx / total) * 50) + 50
            )

            try:
                note = notes[line_idx]
            except IndexError:
                note = {}

            try:
                self.check_indicator_and_data(record)
            except IndicatorValueRejectedError as e:
                note['value'] = f'{e}'
            except Indicator.DoesNotExist:
                note['indicator_name'] = 'Indicator does not found'
            self._save_data_to_log(record, note)

            # If there is note, failed
            note_keys = list(note.keys())
            try:
                note_keys.remove('warning')
            except ValueError:
                pass
            if len(note_keys):
                success = False

        return success, '\n'.join(additional_notes)
