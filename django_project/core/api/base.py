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
__date__ = '12/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

from django.contrib.auth import get_user_model
from django.core.exceptions import (
    FieldError, ValidationError, SuspiciousOperation
)

from geosight.georepo.models.reference_layer import ReferenceLayerView

User = get_user_model()


class FilteredAPI(object):
    """Return User list."""

    def filter_query(self, request, query, ignores: list, fields: list = None):
        """Return filter query."""
        for param, value in request.GET.items():
            field = param.split('__')[0]
            if field in ignores:
                continue

            if fields and field not in fields:
                continue

            if '_in' in param:
                value = value.split(',')

            # Handle reference layer
            if 'reference_layer_id__in' in param:
                value = ReferenceLayerView.objects.filter(
                    identifier__in=value
                ).values_list('id', flat=True)

            if 'dataset_uuid__in' in param:
                value = ReferenceLayerView.objects.filter(
                    identifier__in=value
                ).values_list('id', flat=True)
                param = 'reference_layer_id__in'

            if 'date' in param:
                try:
                    value = datetime.fromtimestamp(int(value))
                except (ValueError, TypeError):
                    pass
            try:
                query = query.filter(**{param: value})
            except FieldError:
                raise SuspiciousOperation(f'Can not query param {param}')
            except ValidationError as e:
                raise SuspiciousOperation(e)
        return query
