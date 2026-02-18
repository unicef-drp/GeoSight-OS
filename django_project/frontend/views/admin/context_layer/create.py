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
from django.shortcuts import redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from geosight.data.forms.context_layer import ContextLayerFrontendForm
from geosight.data.models.context_layer import ContextLayer
from geosight.permission.access import RoleCreatorRequiredMixin


class BaseContextLayerEditView(AdminBaseView):
    """Base Context Layer Edit View."""

    template_name = 'frontend/admin/context_layer/form.html'

    @property
    def form(self):
        """
        Return the form class used for editing context layers.

        :return: The form class.
        :rtype: type[ContextLayerForm]
        """
        return ContextLayerFrontendForm

    @property
    def page_title(self):
        """
        Return the page title used on the browser tab bar.

        :return: Page title string.
        :rtype: str
        """
        return 'Create Context Layer'

    @property
    def content_title(self):
        """
        Return the content title displayed on the page.

        :return:
            HTML string with breadcrumb navigation
            for creating a context layer.
        :rtype: str
        """
        list_url = reverse('admin-context-layer-list-view')
        create_url = reverse('admin-context-layer-create-view')
        return (
            f'<a href="{list_url}">Context Layers</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    def get_context_data(self, **kwargs) -> dict:
        """
        Return context data for rendering the template.

        :param **kwargs: Additional keyword arguments passed to the view.
        :type **kwargs: dict
        :return: Context dictionary including form and permission data.
        :rtype: dict
        """
        context = super().get_context_data(**kwargs)
        initial = None

        # from_id used for duplication
        from_id = self.request.GET.get('from')
        if from_id:
            try:
                model = ContextLayer.objects.get(id=from_id)
                initial = ContextLayerFrontendForm.model_to_initial(model)
                initial['name'] = None
                initial['description'] = None
            except ContextLayer.DoesNotExist:
                pass

        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        context.update(
            {
                'form': self.form(initial=initial),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post(self, request, **kwargs):
        """
        Handle POST request to create a new context layer.

        :param request: The HTTP request object.
        :type request: HttpRequest
        :param **kwargs: Additional keyword arguments.
        :type **kwargs: dict
        :return:
            HTTP redirect response if successful, or rendered form with errors.
        :rtype: HttpResponse
        """
        data = request.POST.copy()
        data['data_fields'] = data.get('data_fields', '[]')
        form = ContextLayerFrontendForm(data)

        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
            instance.save()
            instance.save_relations(data)
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
        try:
            context['errors'] = json.dumps(form.errors)
        except Exception:
            pass
        return render(
            request,
            self.template_name,
            context
        )


class ContextLayerCreateView(
    RoleCreatorRequiredMixin, BaseContextLayerEditView
):
    """ContextLayer Create View."""

    pass
