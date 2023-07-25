# coding=utf-8
from __future__ import unicode_literals

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
from django.contrib.auth.models import Group
from django.db import migrations

from geosight.data.models import (
    BasemapLayer, ContextLayer, Dashboard, Indicator
)
from geosight.permission.models import (
    BasemapLayerPermission, ContextLayerPermission, DashboardPermission,
    IndicatorPermission, GroupModelPermission
)

User = get_user_model()


def run(apps, schema_editor):
    for resource in BasemapLayer.objects.all():
        BasemapLayerPermission.objects.get_or_create(obj=resource)
    for resource in ContextLayer.objects.all():
        ContextLayerPermission.objects.get_or_create(obj=resource)
    for resource in Dashboard.objects.all():
        DashboardPermission.objects.get_or_create(obj=resource)
    for resource in Group.objects.all():
        GroupModelPermission.objects.get_or_create(obj=resource)
    for resource in Indicator.objects.all():
        IndicatorPermission.objects.get_or_create(obj=resource)


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_permission', '0001_initial')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
