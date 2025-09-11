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
from geosight.data.models.indicator import (
    Indicator, IndicatorRule, IndicatorTypeChoices
)
from geosight.permission.access import RoleCreatorRequiredMixin


class BaseIndicatorEditView(AdminBaseView):
    """
    Base view for creating and editing indicators.

    Provides context, form handling, and rule saving logic for indicator
    management in the admin dashboard.
    """

    template_name = 'frontend/admin/indicator/form.html'

    @property
    def page_title(self):
        """
        Return the page title used on the browser tab.

        :rtype: str
        """
        return 'Create Indicator'

    @property
    def content_title(self):
        """
        Return the content title used as the page heading.

        :rtype: str
        """
        list_url = reverse('admin-indicator-list-view')
        create_url = reverse('admin-indicator-create-view')
        return (
            f'<a href="{list_url}">Indicators</a> '
            f'<span>></span> '
            f'<a href="{create_url}">Create</a> '
        )

    @property
    def indicator(self) -> Indicator:
        """
        Return a new indicator instance.

        :rtype: Indicator
        """
        return Indicator()

    def get_context_data(self, **kwargs) -> dict:
        """
        Return context data for rendering the indicator form.

        The context includes:
        - ``form``: Indicator form instance.
        - ``indicator_id``: The indicator ID (if editing an existing one).
        - ``types``: JSON-encoded list of indicator types.
        - ``rules``: JSON-encoded list of indicator rules.
        - ``permission``: JSON-encoded permission settings.

        :param dict **kwargs: Arbitrary keyword arguments passed from the view.
        :return: Context dictionary with indicator-related variables.
        :rtype: dict
        """
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
                'rules': json.dumps(indicator.rules_dict()),
                'permission': json.dumps(permission)
            }
        )
        return context

    def post_save(
            self, indicator: Indicator, data: dict, save_style=True,
            clean_update_permission=True
    ):
        """
        Save permissions and rules for an indicator.

        :param Indicator indicator: The indicator instance being saved.
        :param dict data: POST data from the request.
        :param bool save_style:
            Whether to save indicator rules (default: True).
        :param bool clean_update_permission: Whether to clean existing
            permissions before update (default: True).
        """
        request = self.request
        # Save permission
        indicator.permission.update_from_request_data(
            data, request.user, clean_update=clean_update_permission
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
        """
        Return POST data with default configs if not provided.

        Ensures `aggregation_upper_level_allowed`, `label_config`, and
        `style_config` fields are always set.

        :rtype: dict
        """
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
        """
        Handle POST requests for creating or updating an indicator.

        :param HttpRequest request: The incoming HTTP request.
        :param dict **kwargs: Arbitrary keyword arguments.
        :return: Redirect to edit view on success, or render form on failure.
        :rtype: HttpResponse
        """
        data = self.data
        form = IndicatorForm(data)
        if form.is_valid():
            instance = form.instance
            instance.creator = request.user
            instance.modified_by = request.user
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
        if data.get('permission', None):
            form.permission_data = data.get('permission', None)
        context['form'] = form
        return render(
            request,
            self.template_name,
            context
        )


class IndicatorCreateView(RoleCreatorRequiredMixin, BaseIndicatorEditView):
    """View for creating a new indicator."""

    pass
