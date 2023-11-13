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

from core.utils import string_is_true
from frontend.views.admin._base import AdminBaseView
from geosight.data.forms.indicator import IndicatorForm
from geosight.data.models.code import CodeList
from geosight.data.models.indicator import (
    Indicator, IndicatorRule, IndicatorTypeChoices
)
from geosight.data.models.style.base import DynamicClassificationTypeChoices
from geosight.data.models.style.indicator_style import (
    IndicatorStyleTypeChoices
)
from geosight.data.serializer.code import CodeListSerializer
from geosight.permission.access import RoleCreatorRequiredMixin


class BaseIndicatorEditView(AdminBaseView):
    """Base Indicator Edit View."""

    template_name = 'frontend/admin/indicator/form.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Create Indicator'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-indicator-list-view')
        create_url = reverse('admin-indicator-create-view')
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    @property
    def indicator(self) -> Indicator:
        """Return indicator."""
        return Indicator()

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        indicator = self.indicator
        initial = IndicatorForm.model_to_initial(indicator)
        form = IndicatorForm(initial=initial)
        form.indicator_data = json.dumps(initial)

        # Permissions context
        permission = {
            'list': True, 'read': True, 'edit': True, 'share': True,
            'delete': True
        }
        if self.indicator.id:
            permission = indicator.permission.all_permission(self.request.user)

        context.update(
            {
                'form': form,
                'indicator_id': indicator.id,
                'types': json.dumps(IndicatorTypeChoices),
                'styleTypes': json.dumps(IndicatorStyleTypeChoices),
                'dynamicClassification': json.dumps(
                    DynamicClassificationTypeChoices
                ),
                'rules': json.dumps(indicator.rules_dict()),
                'codelists': json.dumps(
                    CodeListSerializer(CodeList.objects.all(), many=True).data
                ),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post_save(self, indicator: Indicator, data: dict, save_style=True):
        """Save rules."""
        request = self.request
        # Save permission
        indicator.permission.update_from_request_data_in_string(
            data, request.user
        )

        if save_style:
            indicator.indicatorrule_set.all().delete()
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
                        indicator_rule, created = \
                            IndicatorRule.objects.get_or_create(
                                indicator=indicator,
                                name=name
                            )
                        indicator_rule.rule = rule
                        indicator_rule.color = color
                        indicator_rule.order = order
                        indicator_rule.outline_color = outline_color
                        indicator_rule.outline_size = outline_size
                        indicator_rule.active = active
                        indicator_rule.save()
                        order += 1

    @property
    def data(self):
        """Update data of request."""
        data = self.request.POST.copy()
        data['aggregation_upper_level_allowed'] = string_is_true(
            data.get('aggregation_upper_level_allowed', 'False')
        )
        if not data.get('label_config', None):
            data['label_config'] = '{}'
        if not data.get('style_config', None):
            data['style_config'] = '{}'
        return data

    def post(self, request, **kwargs):
        """Create indicator."""
        data = self.data
        form = IndicatorForm(data)
        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
            instance.save()
            instance.update_dashboard_version()
            self.post_save(indicator=instance, data=data)
            return redirect(
                reverse(
                    'admin-indicator-edit-view', kwargs={'pk': instance.id}
                ) + '?success=true'
            )
        context = self.get_context_data(**kwargs)
        form.indicator_data = json.dumps(
            IndicatorForm.model_to_initial(form.instance)
        )
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )


class IndicatorCreateView(RoleCreatorRequiredMixin, BaseIndicatorEditView):
    """Indicator Create View."""

    pass
