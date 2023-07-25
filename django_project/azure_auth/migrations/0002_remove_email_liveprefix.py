# coding=utf-8
"""
GeoSight is UNICEF’s geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '24/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

import re

from django.db import migrations


def patch_existing_user_emails(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    for user in User.objects.filter(email__startswith='live.com#'):
        user.email = re.sub(r'^live\.com#', '', user.email)
        user.username = user.email
        user.save()


class Migration(migrations.Migration):
    dependencies = [
        ('azure_auth', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            patch_existing_user_emails, migrations.RunPython.noop
        ),
    ]
