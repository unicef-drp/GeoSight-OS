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
from django.shortcuts import redirect, reverse, render

from core.forms.group import GroupForm
from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin

User = get_user_model()


class GroupCreateView(RoleSuperAdminRequiredMixin, AdminBaseView):
    """Group Create View."""

    template_name = 'frontend/admin/group/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Group'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-group-list-view')
        create_url = reverse('admin-group-create-view')
        return (
            f'<a href="{list_url}">Groups</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context.update(
            {
                'form': GroupForm()
            }
        )
        return context

    def post(self, request, **kwargs):
        """Create indicator."""
        form = GroupForm(request.POST)
        if form.is_valid():
            users = []
            for key, value in request.POST.items():
                if 'user-' in key:
                    users.append(User.objects.get(id=value))
            group = form.save()
            group.permission.creator = request.user
            group.permission.save()
            for user in group.user_set.all():
                user.groups.remove(group)
            for user in users:
                user.groups.add(group)
            return redirect(reverse('admin-group-list-view'))
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )
