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

from django.db import connections

from geosight.importer.attribute import ImporterAttribute
from geosight.importer.utilities import date_from_timestamp


class QueryError(Exception):
    """Error class for Query."""

    def __init__(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class Aggregations(object):
    """Aggregation query."""

    COUNT = 'COUNT'
    SUM = 'SUM'
    MIN = 'MIN'
    MAX = 'MAX'
    AVG = 'AVG'
    MAJORITY = 'MAJORITY'
    MINORITY = 'MINORITY'


class QueryDataImporter(ABC):
    """Import data from api."""

    importer = None
    attributes = {}
    mapping = {}

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return [
            ImporterAttribute(
                name='filter',
                input_type=ImporterAttributeInputType.TEXT,
                required=False
            ),
            ImporterAttribute(
                name='aggregation',
                input_type=ImporterAttributeInputType.TEXT
            )
        ]

    @property
    def data_table_name(self):
        """Return table name of data."""
        fb_identifier = str(self.importer.unique_id).replace('-', '_')
        return f'data_{fb_identifier}'

    def delete_tables(self):
        """Delete all tables from database."""
        self.cursor.execute(f'DROP TABLE IF EXISTS {self.data_table_name}')

    def insert_features(self, data: list, table_name: str, fields: list):
        """Insert features to table."""
        # -------------------------------------------------
        # Create table
        fields = copy.deepcopy(fields)
        fields += [
            {
                'name': '_row_',
                'type': 'INT'
            }
        ]
        table_definition = []
        for field in fields:
            _type = field["type"]
            if _type.lower() == 'string':
                _type = 'VARCHAR'
            if _type.lower() == 'number':
                _type = 'DOUBLE PRECISION'
            if _type.lower() == 'date':
                _type = 'DATE'
            table_definition.append(f'{field["name"]} {_type}')

        definition = str(tuple(table_definition)).replace("'", "")
        self.cursor.execute(f'CREATE TABLE {table_name} {definition}')
        # -------------------------------------------------
        for idx, row in enumerate(data):
            properties = row
            properties['_row_'] = idx
            values = []
            for field in fields:
                value = properties[field['name']]
                if value is None:
                    value = 'NULL'
                if field['type'].lower() == 'date':
                    if isinstance(value, datetime):
                        value = value.strftime("%Y-%m-%d")
                    elif not isinstance(value, str):
                        value = date_from_timestamp(value).strftime("%Y-%m-%d")
                try:
                    value = value.replace("'", "`").replace('"', "`")
                except Exception:
                    pass
                values.append(value)
            values_str = str(
                tuple(values)).replace('"', "'").replace("''", "'")
            values_str = values_str.replace("'NULL'", "NULL")
            self.cursor.execute(
                f'INSERT INTO {table_name} VALUES {values_str}'
            )

    def querying_data(
            self, data: List, fields: List, group_field: str,
            aggregation: str, input_filter: str = None
    ) -> List:
        """Doing query data.

        :param data: The data that will query-ed.
        :param fields: List of fields definition.
        :param group_field: Field name that will be grouped.
        :param aggregation: Aggregation.
        :param input_filter: Aggregation.
        """
        if not aggregation:
            raise QueryError('Aggregation is error')

        # Filters
        filters = []
        if input_filter:
            filters.append(f'({input_filter})')

        # Aggregation
        aggregation_method = aggregation.split('(')[0]
        try:
            aggregation_field = aggregation.split('(')[1].replace(')', '')
        except IndexError:
            aggregation_field = None
        aggregation_query = None
        if aggregation_method:
            aggregation_method = aggregation_method.upper()
            if aggregation_method == Aggregations.COUNT:
                aggregation_query = 'COUNT(_row_)'
            elif aggregation_method in [
                Aggregations.SUM, Aggregations.MIN,
                Aggregations.MAX, Aggregations.AVG,
                Aggregations.MAJORITY, Aggregations.MINORITY,
            ]:
                if not aggregation_field:
                    raise QueryError(
                        f'Aggregation {aggregation_method} needs field.'
                    )
                aggregation_query = (
                    f'{aggregation_method.upper()}({aggregation_field})'
                )
            else:
                raise QueryError(
                    f'Aggregation {aggregation_method} is not recognized.'
                )
        if not aggregation_query:
            raise QueryError('Aggregation is required.')

        # We do query
        try:
            with connections['temp'].cursor() as cursor:
                self.cursor = cursor
                self.delete_tables()

                # Insert features to database
                self.insert_features(
                    data=data,
                    table_name=self.data_table_name,
                    fields=fields
                )
                # We do query
                _whr = f"{'WHERE ' + ' AND '.join(filters) if filters else ''}"
                _from = f'from {self.data_table_name} data'
                query = (
                    f'SELECT {aggregation_query} as value, {group_field}, '
                    f'COUNT(_row_) as _count_ '
                    f'{_from} {_whr} '
                    f'GROUP BY {group_field} '
                    f'ORDER BY {group_field} '
                )

                # This is query if majority and minority
                if aggregation_method in [
                    Aggregations.MAJORITY, Aggregations.MINORITY
                ]:
                    order = "ASC" \
                        if aggregation_method == Aggregations.MAJORITY \
                        else "DESC"
                    query = (
                        f'SELECT {aggregation_field},{group_field},'
                        f'COUNT({aggregation_field}) as count, '
                        f'COUNT(_row_) as _count_ '
                        f'{_from} {_whr} '
                        f'GROUP BY {aggregation_field},{group_field} '
                        f'ORDER BY count {order}, {aggregation_field} ASC'
                    )
                self.cursor.execute(query)
                rows = self.cursor.fetchall()
                self.delete_tables()

                # Return record with unique data
                data_found = {}
                for row in rows:
                    record = {}
                    try:
                        record['value'] = float(row[0])
                    except Exception:
                        record['value'] = row[0]

                    identifier = ''
                    for idx, field in enumerate(group_field.split(',')):
                        record[field] = row[idx + 1]
                        if isinstance(record[field], date):
                            record[field] = record[field].isoformat()
                        identifier += f'{record[field]}'

                    if identifier not in data_found:
                        data_found[identifier] = {
                            'count': 0,
                            'record': None
                        }

                    data_found[identifier]['count'] += row[len(row) - 1]
                    data_found[identifier]['record'] = record

                records = []
                for identifier, value in data_found.items():
                    if value['record']:
                        record = value['record']
                        count = value['count']
                        if count > 1:
                            record['description'] = (
                                f'{aggregation_method} of {count} records'
                            )
                        records.append(record)
                return records
        except Exception as e:
            with connections['temp'].cursor() as cursor:
                self.cursor = cursor
                self.delete_tables()
            raise QueryError(e)
