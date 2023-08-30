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
from django.core import signing
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, reverse, render

from core.forms.user import UserEditForm, UserViewerEditForm
from frontend.views.admin._base import AdminBaseView

User = get_user_model()


class UserEditView(AdminBaseView):
    """User Edit View."""

    template_name = 'frontend/admin/user/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Edit User'

    @property
    def content_title(self):
        """Return content title that used on page title user."""
        user = get_object_or_404(
            User, username=self.kwargs.get('username', '')
        )
        list_url = reverse('admin-user-and-group-list-view') + '#Users'
        edit_url = reverse('admin-user-edit-view', args=[user.id])
        return (
            f'<a href="{list_url}">Users</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{user.__str__()}</a> '
        )

    def get(self, request, **kwargs):
        """GET function."""
        user = get_object_or_404(
            User, username=self.kwargs.get('username', '')
        )
        request_user = self.request.user
        if not request_user.profile.is_admin and user != self.request.user:
            return HttpResponseForbidden()

        return super().get(request, **kwargs)

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        user = get_object_or_404(
            User, username=self.kwargs.get('username', '')
        )

        Form = UserEditForm
        if not self.request.user.profile.is_admin:
            Form = UserViewerEditForm

        context.update(
            {
                'form': Form(
                    initial=Form.model_to_initial(user)
                ),
                'own_form': user == self.request.user
            }
        )
        return context

    def post(self, request, **kwargs):
        """Edit user."""
        user = get_object_or_404(
            User, username=self.kwargs.get('username', '')
        )
        request_user = self.request.user
        if not request_user.profile.is_admin and user != self.request.user:
            return HttpResponseForbidden()

        data = request.POST.copy()
        Form = UserEditForm
        if not self.request.user.profile.is_admin:
            Form = UserViewerEditForm
            data['role'] = user.profile.role

        form = Form(
            data,
            instance=user
        )
        if form.is_valid():
            user = form.save()
            user.profile.role = form.cleaned_data['role']
            georepo_api_key = data.get(
                'georepo_api_key', user.profile.georepo_api_key_val
            )
            if georepo_api_key:
                user.profile.georepo_api_key = signing.dumps(georepo_api_key)
            else:
                user.profile.georepo_api_key = ''
            user.profile.save()
            if self.request.user.profile.is_admin:
                return redirect(
                    reverse('admin-user-and-group-list-view') + '#Users'
                )
            else:
                return redirect(
                    reverse(
                        'admin-user-edit-view',
                        kwargs={'username': user.username}
                    ) + '?success=true'
                )
        context = self.get_context_data(**kwargs)
        context['form'] = form
        return render(request, self.template_name, context)
