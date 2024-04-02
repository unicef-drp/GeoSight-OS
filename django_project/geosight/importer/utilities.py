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

import math
from datetime import datetime

from pyexcel_xls import get_data as xls_get
from pyexcel_xlsx import get_data as xlsx_get

from geosight.importer.exception import ImporterError


def clean_value(value):
    """Clean value."""
    try:
        value = value.strip()
    except AttributeError:
        pass
    if value is None or value == '':
        return None
    return value


def get_data_from_record(
        key: str, record: dict, data_type=str, required=False
):
    """Return data from record."""
    original_key = f'["{key}"]'
    split_keys = ''.join([f'["{_key}"]' for _key in key.split('.')])

    values = []
    for checked_key in [original_key, split_keys]:
        try:
            values.append(eval(f'record{checked_key}'))
        except (TypeError, KeyError):
            values.append(KeyError)

    if required:
        if values[0] == KeyError and values[1] == KeyError:
            raise ImporterError(f'{key} does not exist')

    for value in values:
        if value is not KeyError:
            return value
    return None


def json_from_excel(content, sheet_name):
    """Return json from excel."""
    try:
        try:
            sheet = xlsx_get(content)
        except Exception:
            sheet = xls_get(content)
    except Exception:
        raise ImporterError('File is not excel.')

    records = sheet[sheet_name][0:]
    headers = sheet[sheet_name][0]

    data = []
    for record in records[1:]:
        if not record:
            continue
        row = {}
        for idx, header in enumerate(headers):
            try:
                row[header] = f'{record[idx]}'
            except (ValueError, IndexError):
                pass
        if row:
            data.append(row)

    return data


def date_from_timestamp(value) -> datetime:
    """Return datetimne from timestamp."""
    try:
        digits = int(math.log10(value))
        if digits == 12:
            value = value / 1000
        elif digits != 9:
            return None
        return datetime.fromtimestamp(value)
    except TypeError:
        return value
