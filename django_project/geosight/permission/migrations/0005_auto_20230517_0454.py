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

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('geosight_data', '0071_alter_relatedtable_managers'),
        ('auth', '0012_alter_user_first_name_max_length'),
        ('geosight_permission', '0004_auto_20220919_0807'),
    ]

    operations = [
        migrations.CreateModel(
            name='RelatedTablePermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization_permission', models.CharField(choices=[('None', 'None'), ('List', 'List'), ('Read', 'Read'), ('Read Data', 'Read Data')], default='List', max_length=16)),
                ('public_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read'), ('Read Data', 'Read Data')], default='None', max_length=16)),
                ('obj', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='permission', to='geosight_data.relatedtable')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterField(
            model_name='referencelayerindicatorpermission',
            name='public_permission',
            field=models.CharField(choices=[('None', 'None'), ('Read', 'Read')], default='None', max_length=16),
        ),
        migrations.CreateModel(
            name='RelatedTableUserPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Read Data', 'Read Data'), ('Write', 'Write'), ('Write Data', 'Write Data'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_permissions', to='geosight_permission.relatedtablepermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'user')},
            },
        ),
        migrations.CreateModel(
            name='RelatedTableGroupPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Read Data', 'Read Data'), ('Write', 'Write'), ('Write Data', 'Write Data'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_permissions', to='geosight_permission.relatedtablepermission')),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'group')},
            },
        ),
    ]
