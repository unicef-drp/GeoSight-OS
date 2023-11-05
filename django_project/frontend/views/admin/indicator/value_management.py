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

import datetime

from django.http import HttpResponseBadRequest
from django.shortcuts import redirect, reverse, get_object_or_404

from frontend.views._base import BaseView
from frontend.views.admin._base import AdminBaseView
from geosight.data.models import (
    Indicator, IndicatorExtraValue, IndicatorValueRejectedError
)
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView, ReferenceLayerIndicator
)
from geosight.permission.access.mixin import (
    RoleContributorRequiredMixin, read_permission_resource,
    edit_permission_resource
)
from geosight.permission.models.resource import (
    ReferenceLayerIndicatorPermission
)


class IndicatorValueManagementMapView(
    RoleContributorRequiredMixin, AdminBaseView
):
    """Indicator Value Management Map View."""

    template_name = 'frontend/admin/indicator/value-management-map.html'
    indicator = None

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Indicator Value Manager Map'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        self.indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-indicator-list-view')
        edit_url = reverse(
            'admin-indicator-edit-view', args=[self.indicator.id]
        )
        form_url = reverse(
            'admin-indicator-value-mapview-manager', args=[self.indicator.id]
        )
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{self.indicator.__str__()}</a> '
            f'<span>></span> '
            f'<a href="{form_url}">Value Manager Map</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        self.indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        read_permission_resource(self.indicator, self.request.user)
        context = super().get_context_data(**kwargs)
        legends = {
            'NODATA': {
                'name': 'No Data',
                'color': 'gray'
            },
            'LATESTDATAFOUND': {
                'name': 'Has Data',
                'color': 'green'
            },
            'NEEDUPDATE': {
                'name': 'Need Update Data',
                'color': 'red'
            }
        }
        context.update(
            {
                'indicator': self.indicator,
                'geometry_has_updated_value': list(
                    set(
                        self.indicator.query_values(
                            datetime.date.today()
                        ).exclude(
                            geom_id='undefined'
                        ).values_list('geom_id', flat=True)
                    )
                ),
                'geometry_has_value': list(
                    set(
                        self.indicator.indicatorvalue_set.values_list(
                            'geom_id', flat=True
                        )
                    )
                ),
                'legends': legends,
                'url_value_by_geometry': reverse(
                    'indicator-values-by-geometry', args=[
                        self.indicator.id, 0
                    ]
                )
            }
        )
        return context


class IndicatorValueManagementTableView(
    RoleContributorRequiredMixin, BaseView):
    """Indicator Value Management Form View."""

    template_name = 'frontend/admin/indicator/value-management-form.html'
    indicator = None

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Indicator Value Manager Form'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        self.indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-indicator-list-view')
        edit_url = reverse(
            'admin-indicator-edit-view', args=[self.indicator.id]
        )
        form_url = reverse(
            'admin-indicator-value-form-manager', args=[self.indicator.id]
        )
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{self.indicator.__str__()}</a> '
            f'<span>></span> '
            f'<a href="{form_url}">Value Manager Form</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context."""
        context = super().get_context_data(**kwargs)
        self.indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        read_permission_resource(self.indicator, self.request.user)
        context.update(
            {
                'indicator': self.indicator,
                'values': self.indicator.indicatorvalue_set.order_by('-date')
            }
        )
        return context

    def post(self, request, **kwargs):
        """Save value of indicator."""
        indicator = get_object_or_404(
            Indicator, id=self.kwargs.get('pk', '')
        )
        date = request.POST.get('date', None)
        reference_layer = request.POST.get('reference_layer', None)
        admin_level = request.POST.get('admin_level', None)
        if not reference_layer:
            return HttpResponseBadRequest('Reference layer is needed.')

        reference_layer, created = ReferenceLayerView.objects.get_or_create(
            identifier=reference_layer
        )
        dataset, created = ReferenceLayerIndicator.objects.get_or_create(
            reference_layer=reference_layer,
            indicator=indicator
        )
        # Make sure we have permission
        ReferenceLayerIndicatorPermission.objects.get_or_create(obj=dataset)
        edit_permission_resource(dataset, self.request.user)
        if date:
            try:
                indicator_values = {}
                # save data by geometry
                for key, value in request.POST.dict().items():
                    if value and 'geometry:' in key:
                        code = key.replace('geometry:', '')
                        indicator_value = indicator.save_value(
                            date, code, value,
                            reference_layer=reference_layer.identifier,
                            admin_level=admin_level,
                            more_error_information=True
                        )
                        indicator_values[code] = indicator_value

                # we need to check extra value
                for key, extra_value in request.POST.dict().items():
                    if 'extra_value' in key:
                        keys = key.split(':')
                        report_id = keys[2]
                        extra_name = request.POST.get(
                            key.replace('extra_value', 'extra_name'), None
                        )
                        if extra_name and extra_value:
                            try:
                                indicator_value = indicator_values[report_id]
                                indicator_extra_value, created = \
                                    IndicatorExtraValue.objects.get_or_create(
                                        indicator_value=indicator_value,
                                        name=extra_name
                                    )
                                indicator_extra_value.value = extra_value
                                indicator_extra_value.save()
                            except KeyError:
                                pass
            except IndicatorValueRejectedError as e:
                return HttpResponseBadRequest(f'{e}')

        return redirect(reverse('admin-indicator-list-view'))
