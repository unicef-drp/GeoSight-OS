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

from geosight.data.models.dashboard import (
    Dashboard, DashboardBasemap, DashboardIndicator
)
from geosight.georepo.models.reference_layer import ReferenceLayerView

User = get_user_model()


class FilteredAPI(object):
    """Return User list."""

    def filter_query(
            self, request, query, ignores: list, fields: list = None,
            sort: str = None, distinct: str = None, none_is_null: bool = True,
    ):
        """Return filter query."""
        # Exclude sort to filter
        if not ignores:
            ignores = []
        ignores.append('sort')
        ignores.append('distinct')
        ignores.append('encoding')
        ignores.append('Content-Type')

        for param, value in request.GET.items():
            is_equal = True
            if value and value[0] == '!':
                value = value[1:]
                is_equal = False

            field = param.split('__')[0]
            if field in ignores:
                continue

            if fields and field not in fields:
                continue

            if '_in' in param:
                value = value.split(',')

            # TODO:
            #  This will be fixed
            if param == 'reference_layer_uuid':
                value = [value]
            if param in [
                'reference_layer_id__in', 'dataset_uuid__in',
                'reference_layer_uuid'
            ]:
                countries = []
                for view in ReferenceLayerView.objects.filter(
                        identifier__in=value
                ):
                    countries += view.countries.values_list('id', flat=True)
                value = countries
                param = 'country_id__in'

            # Handle project filters
            if 'project_' in field:
                projects = Dashboard.objects.filter(
                    **{param.replace('project_', ''): value}
                )
                if query.model.__name__ == "BasemapLayer":
                    value = DashboardBasemap.objects.filter(
                        dashboard__in=projects
                    ).values_list('object_id', flat=True)
                    param = 'id__in'
                elif query.model.__name__ == "Indicator":
                    value = DashboardIndicator.objects.filter(
                        dashboard__in=projects
                    ).values_list('object_id', flat=True)
                    param = 'id__in'

            if 'date' in param:
                try:
                    value = datetime.fromtimestamp(int(value))
                except (ValueError, TypeError):
                    pass
            try:
                if none_is_null and ('NaN' in value or 'None' in value):
                    param = f'{field}__isnull'
                    value = True

                if is_equal:
                    query = query.filter(**{param: value})
                else:
                    query = query.exclude(**{param: value})
            except FieldError:
                raise SuspiciousOperation(f'Can not query param {param}')
            except ValidationError as e:
                raise SuspiciousOperation(e)

        if sort:
            query = query.order_by(*sort.split(','))

        if distinct:
            if not sort:
                query = query.order_by(*distinct.split(','))
            query = query.distinct(*distinct.split(','))

        return query
