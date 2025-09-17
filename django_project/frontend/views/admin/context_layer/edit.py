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

from django.shortcuts import get_object_or_404, redirect, reverse, render

from frontend.views.admin._base import AdminBaseView, AdminBatchEditView
from frontend.views.admin.context_layer.create import (
    BaseContextLayerEditView
)
from geosight.data.forms.context_layer import ContextLayerForm
from geosight.data.models.context_layer import ContextLayer
from geosight.permission.access import (
    edit_permission_resource,
    RoleContributorRequiredMixin
)


class ContextLayerEditView(RoleContributorRequiredMixin, AdminBaseView):
    """ContextLayer Edit View."""

    template_name = 'frontend/admin/context_layer/form.html'

    @property
    def page_title(self):
        """
        Return the page title used on the browser tab bar.

        :return: Page title string.
        :rtype: str
        """
        return 'Edit Context Layer'

    @property
    def content_title(self):
        """
        Return the content title displayed on the page title section.

        :return:
            HTML string containing breadcrumb-style links
            for editing the context layer.
        :rtype: str
        """
        context_layer = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        list_url = reverse('admin-context-layer-list-view')
        edit_url = reverse(
            'admin-context-layer-edit-view', args=[context_layer.id]
        )
        return (
            f'<a href="{list_url}">Context Layers</a> '
            f'<span>></span> '
            f'<a href="{edit_url}">{context_layer.__str__()}</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """
        Return context data for rendering the template.

        :param **kwargs: Additional keyword arguments passed to the view.
        :type **kwargs: dict
        :return:
            Context dictionary including the form,
            instance, and permission data.
        :rtype: dict
        """
        context = super().get_context_data(**kwargs)
        instance = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(instance, self.request.user)
        permission = instance.permission.all_permission(self.request.user)

        context.update(
            {
                'id': instance.id,
                'form': ContextLayerForm(
                    initial=ContextLayerForm.model_to_initial(instance)
                ),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """
        Handle POST request to edit a context layer.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :param **kwargs: Additional keyword arguments.
        :type **kwargs: dict
        :return:
            HTTP redirect response if successful, or rendered form with errors.
        :rtype: HttpResponse
        """
        instance = get_object_or_404(
            ContextLayer, id=self.kwargs.get('pk', '')
        )
        edit_permission_resource(instance, self.request.user)
        data = request.POST.copy()
        data['data_fields'] = request.POST.get('data_fields', '[]')
        form = ContextLayerForm(
            data,
            instance=instance
        )

        if form.is_valid():
            context_layer = form.save(commit=False)
            context_layer.modified_by = request.user
            context_layer.save()
            context_layer.save_relations(data)
            # Save permission
            instance.permission.update_from_request_data(
                request.POST, request.user
            )
            return redirect(
                reverse(
                    'admin-context-layer-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        if data.get('permission', None):
            form.permission_data = data.get('permission', None)
        context['form'] = form
        return render(request, self.template_name, context)


class ContextLayerEditBatchView(
    AdminBatchEditView, BaseContextLayerEditView
):
    """ContextLayer Edit Batch View."""

    template_name = 'frontend/admin/context_layer/form.html'

    @property
    def page_title(self):
        """
        Return the page title used on the browser tab bar.

        :return: Page title string.
        :rtype: str
        """
        return 'Edit Batch Context Layer'

    @property
    def content_title(self):
        """
        Return the content title displayed on the page title section.

        :return:
            HTML string containing breadcrumb-style links for batch editing.
        :rtype: str
        """
        list_url = reverse('admin-context-layer-list-view')
        return (
            f'<a href="{list_url}">Context Layers</a> '
            f'<span>></span> '
            f'Edit Batch'
        )

    @property
    def edit_query(self):
        """
        Return the queryset of context layers that the user can edit.

        :return: Queryset of editable context layers.
        :rtype: QuerySet
        """
        return ContextLayer.permissions.edit(self.request.user)

    @property
    def form(self):
        """
        Return the form class used for editing context layers.

        :return: The form class.
        :rtype: type[ContextLayerForm]
        """
        return ContextLayerForm

    @property
    def redirect_url(self):
        """
        Return the URL to redirect to after a successful batch edit.

        :return: Redirect URL string.
        :rtype: str
        """
        return reverse('admin-context-layer-list-view')
