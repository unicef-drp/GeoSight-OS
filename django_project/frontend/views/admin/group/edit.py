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

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404, redirect, reverse, render

from core.forms.group import GroupForm
from core.models.group import GeosightGroup
from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin

User = get_user_model()


class GroupEditView(RoleSuperAdminRequiredMixin, AdminBaseView):
    """Group Edit View."""

    template_name = 'frontend/admin/group/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit Group'

    @property
    def content_title(self):
        """Return content title that used on page title group."""
        group = get_object_or_404(
            GeosightGroup, pk=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-user-and-group-list-view') + '#Groups'
        edit_url = reverse('admin-group-edit-view', args=[group.id])
        return (
            f'<a href="{list_url}">Groups</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{group.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        group = get_object_or_404(
            GeosightGroup, pk=self.kwargs.get('pk', '')
        )
        detail_api_url = reverse('group-detail-api', args=[group.id])

        context.update(
            {
                'form': GroupForm(
                    initial=GroupForm.model_to_initial(group)
                ),
                'group_detail_api': detail_api_url
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit group."""
        group = get_object_or_404(
            GeosightGroup, pk=self.kwargs.get('pk', '')
        )
        form = GroupForm(
            request.POST,
            instance=group
        )
        if form.is_valid():
            group = form.save()
            for user in group.user_set.all():
                user.groups.remove(group)

            # Add user to group
            for _id in request.POST.get('users', '').split(','):
                try:
                    user = User.objects.get(id=_id)
                    user.groups.add(group)
                except (ValueError, User.DoesNotExist):
                    pass
            return redirect(
                reverse('admin-user-and-group-list-view') + '#Groups'
            )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)
