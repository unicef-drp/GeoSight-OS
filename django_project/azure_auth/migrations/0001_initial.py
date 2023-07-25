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
__date__ = '26/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import django.db.models.deletion
from django.contrib.auth.models import Group
from django.db import migrations, models

from azure_auth.models import RegisteredDomain


def default_domain(apps, schema_editor):
    """Create default domain."""
    group, _ = Group.objects.get_or_create(name='unicef')
    RegisteredDomain.objects.get_or_create(
        domain='unicef.org',
        defaults={
            'group': group
        }
    )


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='RegisteredDomain',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False,
                                           verbose_name='ID')),
                ('domain', models.CharField(max_length=256, unique=True)),
                ('group', models.ForeignKey(blank=True,
                                            help_text='Autoassign user under the domain to the group.',
                                            null=True,
                                            on_delete=django.db.models.deletion.SET_NULL,
                                            to='auth.group')),
            ],
        ),
        migrations.RunPython(default_domain, migrations.RunPython.noop),
    ]
