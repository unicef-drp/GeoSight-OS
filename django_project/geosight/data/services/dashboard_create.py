# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
from dataclasses import dataclass
from typing import Dict, Optional

from django.contrib.auth import get_user_model
from django.db import transaction

from geosight.data.forms.dashboard import DashboardForm
from geosight.data.models.dashboard import Dashboard

User = get_user_model()
INTERNAL_CREATE_ERROR = (
    'Unable to create dashboard due to an internal error.'
)


@dataclass
class DashboardCreateResult:
    """Container for dashboard create flow output."""

    dashboard: Optional[Dashboard] = None
    error: Optional[str] = None
    form_errors: Optional[Dict] = None


def create_dashboard_from_payload(
    payload: dict, user: User, files
) -> DashboardCreateResult:
    """
    Create a dashboard using the shared UI/API creation flow.

    :param payload: Incoming payload from UI or API request.
    :type payload: dict
    :param user: Authenticated user creating the dashboard.
    :type user: User
    :param files: Uploaded files dictionary.
    :type files: MultiValueDict or dict
    :return: The result containing a dashboard or error details.
    :rtype: DashboardCreateResult
    """
    data = payload.copy()

    try:
        data = DashboardForm.update_data(data, user=user)
        if Dashboard.name_is_exist_of_all(data['slug']):
            return DashboardCreateResult(
                error=(
                    f'Dashboard with this url shortcode : {data["slug"]} '
                    f'is exist. Please choose other url shortcode.'
                )
            )
    except (PermissionError, ValueError, KeyError) as exc:
        return DashboardCreateResult(error=str(exc))

    origin = None
    origin_id = data.get('origin_id', None)
    if origin_id:
        try:
            origin = Dashboard.objects.get(id=origin_id)
        except Dashboard.DoesNotExist:
            return DashboardCreateResult(error='Origin project is not found.')

    data['creator'] = user
    data['modified_by'] = user
    form = DashboardForm(data, files)
    if not form.is_valid():
        return DashboardCreateResult(form_errors=dict(form.errors.items()))

    try:
        with transaction.atomic():
            dashboard = form.save()
            if origin:
                dashboard.icon = origin.icon
                dashboard.save()
            dashboard.save_relations(data, is_create=True)
            dashboard.increase_version()
            return DashboardCreateResult(dashboard=dashboard)
    except Exception:
        return DashboardCreateResult(error=INTERNAL_CREATE_ERROR)
