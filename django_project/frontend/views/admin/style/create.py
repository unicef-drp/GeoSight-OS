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

from django.contrib.auth import get_user_model
from django.shortcuts import redirect, reverse, render

from frontend.views.admin._base import AdminBaseView
from geosight.data.forms.style import StyleForm
from geosight.data.models.code import CodeList
from geosight.data.models.indicator import IndicatorTypeChoices
from geosight.data.models.style import Style, StyleRule
from geosight.data.models.style.base import (
    StyleTypeChoices, DynamicClassificationTypeChoices
)
from geosight.data.serializer.code import CodeListSerializer
from geosight.permission.access import RoleCreatorRequiredMixin

User = get_user_model()


class BaseStyleEditingView(AdminBaseView):
    """Style Create View."""

    template_name = 'frontend/admin/style/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Style'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-style-list-view')
        create_url = reverse('admin-style-create-view')
        return (
            f'<a href="{list_url}">Styles</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    @property
    def style(self):
        """Return style."""
        return Style()

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        initial = StyleForm.model_to_initial(self.style)
        form = StyleForm(initial=initial)
        form.instance_data = json.dumps(initial)
        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        if self.style.id:
            permission = self.style.permission.all_permission(
                self.request.user
            )
        context.update(
            {
                'id': self.style.id,
                'form': form,
                'types': json.dumps(IndicatorTypeChoices),
                'rules': json.dumps(self.style.rules_dict()),
                'styleTypes': json.dumps(StyleTypeChoices),
                'dynamicClassification': json.dumps(
                    DynamicClassificationTypeChoices
                ),
                'codelists': json.dumps(
                    CodeListSerializer(CodeList.objects.all(), many=True).data
                ),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post_save(self, style: Style, data: dict, save_style=True):
        """Save rules."""
        request = self.request
        # Save permission
        style.permission.update_from_request_data(
            data, request.user
        )

        if save_style:
            style.stylerule_set.all().delete()
            order = 0
            for req_key, value in request.POST.dict().items():
                if 'rule_name_' in req_key:
                    idx = req_key.replace('rule_name_', '')
                    name = request.POST.get(f'rule_name_{idx}', None)
                    rule = request.POST.get(f'rule_rule_{idx}', None)
                    color = request.POST.get(f'rule_color_{idx}', None)
                    outline_color = request.POST.get(
                        f'rule_outline_color_{idx}', None)
                    outline_size = request.POST.get(
                        f'rule_outline_size_{idx}', 0.5)

                    active = request.POST.get(f'rule_active_{idx}', 'true')
                    active = True if active.lower() == 'true' else False

                    if rule and name:
                        style_rule = StyleRule.objects.create(
                            style=style, name=name
                        )
                        style_rule.rule = rule
                        style_rule.color = color
                        style_rule.order = order
                        style_rule.outline_color = outline_color
                        style_rule.outline_size = outline_size
                        style_rule.active = active
                        style_rule.save()
                        order += 1

    @property
    def data(self):
        """Update data of request."""
        data = self.request.POST.copy()
        if not data.get('style_config', None):
            data['style_config'] = '{}'
        return data

    def post(self, request, **kwargs):
        """Create indicator."""
        data = self.data
        form = StyleForm(data)
        if form.is_valid():
            instance = form.save()
            instance.creator = request.user
            instance.save()
            self.post_save(style=instance, data=request.POST)
            return redirect(
                reverse(
                    'admin-style-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        form.instance_data = json.dumps(
            StyleForm.model_to_initial(form.instance)
        )
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )


class StyleCreateView(RoleCreatorRequiredMixin, BaseStyleEditingView):
    """Style Create View."""

    pass
