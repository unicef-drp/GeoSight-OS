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

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0039_change_default_color_indicator'),
    ]

    operations = [
        migrations.CreateModel(
            name='Code',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('value', models.CharField(help_text='Code value that used as a code.', max_length=512, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='CodeList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterModelOptions(
            name='indicatorgroup',
            options={'ordering': ('name',)},
        ),
        migrations.AddField(
            model_name='indicator',
            name='max_value',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='indicator',
            name='min_value',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='indicator',
            name='type',
            field=models.CharField(choices=[('Integer', 'Integer'), ('Float', 'Float'), ('String', 'Category')], default='Float', max_length=256),
        ),
        migrations.AddField(
            model_name='indicatorvalue',
            name='value_str',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
        migrations.AlterField(
            model_name='indicatorvalue',
            name='value',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='indicator',
            name='codelist',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.codelist'),
        ),
        migrations.CreateModel(
            name='CodeInCodeList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('code', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.code')),
                ('codelist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.codelist')),
            ],
            options={
                'ordering': ('order',),
                'unique_together': {('codelist', 'code')},
            },
        ),
    ]
