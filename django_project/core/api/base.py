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
from django.db.models import Q

from geosight.data.models.dashboard import (
    Dashboard, DashboardBasemap, DashboardIndicator
)
from geosight.georepo.models.reference_layer import ReferenceLayerView

User = get_user_model()


class FilteredAPI(object):
    """Return User list."""

    query_search_fields = []

    def query_search(self, query, queryset):
        """
        Filter the queryset based on the search query and predefined fields.

        This method is called when filtering with the 'q' parameter. It applies
        a case-insensitive search (`icontains`) across the fields specified
        in `self.query_search_fields`.

        :param query: The search string used to filter the queryset.
        :type query: str
        :param queryset: The initial queryset to be filtered.
        :type queryset: QuerySet
        :return: A filtered queryset containing objects matching the search.
        :rtype: QuerySet
        """
        if self.query_search_fields:
            queries = Q()
            for field in self.query_search_fields:
                queries |= Q(**{f'{field}__icontains': query})
            queryset = queryset.filter(queries)
        return queryset

    def filter_query(
            self, request, query, ignores: list, fields: list = None,
            sort: str = None, distinct: str = None, none_is_null: bool = True,
    ):
        """
        Apply dynamic filters to a queryset based on request parameters.

        This method parses the GET parameters from the request and applies
        filtering, exclusion, sorting, and distinct clauses to the provided
        queryset.

        Special logic is applied for certain fields such as:
        - Parameters prefixed with `!` are used for exclusion.
        - `_in` suffix is used for multiple values (comma-separated).
        - Fields like `reference_layer_uuid`, `project_*`, and `*_date` have
          custom handling.
        - Converts "NaN" and "None" values to `isnull` checks when
          `none_is_null` is True.
        - Supports simple full-text search via `q` parameter if
          `query_search` is defined.

        :param request: The HTTP request containing GET parameters.
        :type request: HttpRequest
        :param query: The initial queryset to filter.
        :type query: QuerySet
        :param ignores: List of parameter names to ignore during filtering.
        :type ignores: list
        :param fields:
            Optional list of fields that are allowed to be filtered.
        :type fields: list, optional
        :param sort:
            Optional comma-separated string of field names for sorting.
        :type sort: str, optional
        :param distinct:
            Optional comma-separated string of fields for distinct clause.
        :type distinct: str, optional
        :param none_is_null:
            If True, string values "NaN" or "None" are treated as null.
        :type none_is_null: bool
        :return: The filtered queryset.
        :rtype: QuerySet

        :raises SuspiciousOperation:
            If a filter references an invalid field or invalid value.
        """
        # Exclude sort to filter
        if not ignores:
            ignores = []
        ignores.append('sort')
        ignores.append('distinct')
        ignores.append('encoding')
        ignores.append('Content-Type')
        ignores.append('q')

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

        if request.GET.get('q'):
            query = self.query_search(request.GET.get('q'), query)

        if sort:
            query = query.order_by(*sort.split(','))

        if distinct:
            if not sort:
                query = query.order_by(*distinct.split(','))
            query = query.distinct(*distinct.split(','))

        return query
