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
__date__ = '31/01/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

from django.shortcuts import redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from geosight.data.forms.related_table import RelatedTableForm
from geosight.data.models.related_table import RelatedTable
from geosight.permission.access import RoleCreatorRequiredMixin


class RelatedTableCreateView(RoleCreatorRequiredMixin, AdminBaseView):
    """Related Table Create View."""

    template_name = 'frontend/admin/related-table/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Related Table'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-related-table-list-view')
        create_url = reverse('admin-related-table-create-view')
        return (
            f'<a href="{list_url}">Related Tables</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        rules = []
        initial = None

        # from_id used for duplication
        from_id = self.request.GET.get('from')
        if from_id:
            try:
                model = RelatedTable.objects.get(id=from_id)
                initial = RelatedTableForm.model_to_initial(model)
                initial['name'] = None
                initial['description'] = None
                rules = model.rules_dict()
            except RelatedTable.DoesNotExist:
                pass
        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        context.update(
            {
                'form': RelatedTableForm(initial=initial),
                'rules': rules,
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """Create indicator."""
        form = RelatedTableForm(request.POST)
        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
            instance.save()
            # Save permission
            instance.permission.update_from_request_data_in_string(
                request.POST, request.user
            )
            return redirect(
                reverse(
                    'admin-related-table-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
