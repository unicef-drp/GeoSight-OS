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

import json
from json.decoder import JSONDecodeError

from django.db import transaction
from django.http import HttpResponseBadRequest, HttpResponse
from django.shortcuts import get_object_or_404, reverse

from core.utils import string_is_true
from frontend.views.admin._base import AdminBaseView
from geosight.georepo.models import ReferenceLayerView
from geosight.importer.exception import ImporterError, ImporterDoesNotExist
from geosight.importer.form import ImporterForm
from geosight.importer.models import Importer
from geosight.permission.access import RoleContributorRequiredMixin


class ImporterCreateView(RoleContributorRequiredMixin, AdminBaseView):
    """Importer Create View."""

    template_name = 'frontend/admin/importer/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Data Management'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        data_importer = reverse('admin-data-management-list-view')
        import_data = reverse('admin-importer-create-view')
        return (
            f'<a href="{data_importer}">Data Management</a>'
            '<span>></span>'
            f'<a href="{import_data}">Import Data</a>'
        )

    @property
    def instance(self):
        """Return instance."""
        return None

    def post(self, request, **kwargs):
        """POST data for importer configuration."""
        data = request.POST.copy()
        reference_layer = None
        if data.get('reference_layer', None):
            reference_layer, _ = ReferenceLayerView.objects.get_or_create(
                identifier=data.get('reference_layer', None)
            )
        data['reference_layer'] = reference_layer

        try:
            data['mapping'] = json.loads(data.get('mapping', '{}'))
        except JSONDecodeError:
            return HttpResponseBadRequest('Mapping is not in json format')

        try:
            data['alerts'] = json.loads(data.get('alerts', '{}'))
        except JSONDecodeError:
            return HttpResponseBadRequest('Alerts is not in json format')

        # Create creator date
        data['run_on_create'] = string_is_true(
            data.get('run_on_create', 'true')
        )

        form = ImporterForm(data, instance=self.instance)
        if form.is_valid():
            try:
                with transaction.atomic():
                    importer = form.save()
                    if not importer.creator:
                        importer.creator = request.user
                    importer.save_attributes(data, request.FILES)
                    importer.change_job(data.get('schedule', None))
                return HttpResponse(importer.post_saved(), status=201)
            except (ImporterError, ImporterDoesNotExist) as e:
                return HttpResponseBadRequest(f'{e}')
            except FileNotFoundError:
                return HttpResponseBadRequest(
                    'The file was not found. Please re-upload the file.'
                )
        errors = []
        for key, value in form.errors.items():
            errors.append(f'{key} - {value[0]}')
        return HttpResponseBadRequest(', '.join(errors))


class ImporterEditView(ImporterCreateView):
    """Importer Edit View."""

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        context['obj_id'] = self.instance.id
        return context

    @property
    def instance(self):
        """Return instance."""
        return get_object_or_404(
            Importer, id=self.kwargs.get('pk', '')
        )

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        importer = self.instance
        log = self.instance.importerlog_set.first()
        importer_edit = reverse(
            'admin-importer-edit-view', args=[importer.id]
        )
        data_importer = reverse('admin-data-management-list-view')
        logs = reverse('admin-data-management-list-view') + '#Logs'
        log_url = reverse(
            'admin-importer-log-detail-view', args=[log.id]
        )
        return (
            f'<a href="{data_importer}">Data Management</a>'
            '<span>></span>'
            f'<a href="{logs}">Logs</a>'
            f'<span>></span> '
            f'<a href="{log_url}">{log.importer.__str__()}</a>'
            f'<span>></span> '
            f'<a href="{importer_edit}">Edit</a>'
        )


class ImporterScheduledEditView(ImporterEditView):
    """Importer Scheduled Edit View."""

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        importer = self.instance
        data_importer = reverse('admin-data-management-list-view')
        list_url = reverse(
            'admin-data-management-list-view') + '#Scheduled Jobs'
        importer_url = reverse(
            'admin-importer-detail-view', args=[importer.id]
        )
        importer_edit = reverse(
            'admin-scheduled-importer-edit-view', args=[importer.id]
        )
        return (
            f'<a href="{data_importer}">Data Management</a>'
            '<span>></span>'
            f'<a href="{list_url}">Scheduled Jobs</a>'
            f'<span>></span> '
            f'<a href="{importer_url}">{importer.__str__()}</a>'
            f'<span>></span> '
            f'<a href="{importer_edit}">Edit</a>'
        )
