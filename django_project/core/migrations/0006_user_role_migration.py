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
from django.db import migrations

from core.models.profile import Profile, ROLES

User = get_user_model()


def run(apps, schema_editor):
    for user in User.objects.all():
        if user.is_staff:
            Profile.update_role(user, ROLES.SUPER_ADMIN.name)
        else:
            Profile.update_role(user, ROLES.VIEWER.name)


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0005_profile')
    ]

    operations = [
        migrations.RunPython(run, migrations.RunPython.noop),
    ]
