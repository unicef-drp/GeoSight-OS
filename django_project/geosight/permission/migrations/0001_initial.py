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
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0007_geosightgroup'),
        ('geosight_georepo', '0002_referencelayerindicator'),
        ('auth', '0012_alter_user_first_name_max_length'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('geosight_data', '0037_auto_20220907_0325'),
    ]

    operations = [
        migrations.CreateModel(
            name='BasemapLayerPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization_permission', models.CharField(choices=[('None', 'None'), ('List', 'List'), ('Read', 'Read')], default='List', max_length=16)),
                ('public_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read')], default='None', max_length=16)),
                ('obj', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='permission', to='geosight_data.basemaplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ContextLayerPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization_permission', models.CharField(choices=[('None', 'None'), ('List', 'List'), ('Read', 'Read')], default='List', max_length=16)),
                ('public_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read')], default='None', max_length=16)),
                ('obj', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='permission', to='geosight_data.contextlayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='DashboardPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization_permission', models.CharField(choices=[('None', 'None'), ('List', 'List'), ('Read', 'Read')], default='None', max_length=16)),
                ('public_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read')], default='None', max_length=16)),
                ('obj', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='permission', to='geosight_data.dashboard')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='GroupModelPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('modified_at', models.DateTimeField(auto_now=True)),
                ('organization_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read'), ('Write', 'Write')], default='None', max_length=16)),
                ('public_permission', models.CharField(choices=[('None', 'None')], default='None', max_length=16)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('obj', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='permission', to='core.geosightgroup')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='IndicatorPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization_permission', models.CharField(choices=[('None', 'None'), ('List', 'List'), ('Read', 'Read')], default='List', max_length=16)),
                ('public_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read')], default='None', max_length=16)),
                ('obj', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='permission', to='geosight_data.indicator')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ReferenceLayerIndicatorPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read'), ('Write', 'Write')], default='None', max_length=16)),
                ('public_permission', models.CharField(choices=[('None', 'None'), ('Read', 'Read'), ('Write', 'Write')], default='None', max_length=16)),
                ('obj', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='permission', to='geosight_georepo.referencelayerindicator')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ReferenceLayerIndicatorUserPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('Read', 'Read'), ('Write', 'Write')], default='List', max_length=16)),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_permissions', to='geosight_permission.referencelayerindicatorpermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'user')},
            },
        ),
        migrations.CreateModel(
            name='ReferenceLayerIndicatorGroupPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('Read', 'Read'), ('Write', 'Write')], default='List', max_length=16)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_permissions', to='geosight_permission.referencelayerindicatorpermission')),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'group')},
            },
        ),
        migrations.CreateModel(
            name='IndicatorUserPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_permissions', to='geosight_permission.indicatorpermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'user')},
            },
        ),
        migrations.CreateModel(
            name='IndicatorGroupPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_permissions', to='geosight_permission.indicatorpermission')),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'group')},
            },
        ),
        migrations.CreateModel(
            name='GroupModelUserPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('Read', 'Read'), ('Write', 'Write')], default='Read', max_length=16)),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_permissions', to='geosight_permission.groupmodelpermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'user')},
            },
        ),
        migrations.CreateModel(
            name='GroupModelGroupPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('Read', 'Read'), ('Write', 'Write')], default='Read', max_length=16)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_permissions', to='geosight_permission.groupmodelpermission')),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'group')},
            },
        ),
        migrations.CreateModel(
            name='DashboardUserPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_permissions', to='geosight_permission.dashboardpermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'user')},
            },
        ),
        migrations.CreateModel(
            name='DashboardGroupPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_permissions', to='geosight_permission.dashboardpermission')),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'group')},
            },
        ),
        migrations.CreateModel(
            name='ContextLayerUserPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_permissions', to='geosight_permission.contextlayerpermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'user')},
            },
        ),
        migrations.CreateModel(
            name='ContextLayerGroupPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_permissions', to='geosight_permission.contextlayerpermission')),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'group')},
            },
        ),
        migrations.CreateModel(
            name='BasemapLayerUserPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_permissions', to='geosight_permission.basemaplayerpermission')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'user')},
            },
        ),
        migrations.CreateModel(
            name='BasemapLayerGroupPermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Write', 'Write'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16)),
                ('group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='auth.group')),
                ('obj', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_permissions', to='geosight_permission.basemaplayerpermission')),
            ],
            options={
                'abstract': False,
                'unique_together': {('obj', 'group')},
            },
        ),
    ]
