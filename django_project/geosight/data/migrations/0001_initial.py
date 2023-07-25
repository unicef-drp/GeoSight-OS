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

import datetime
from django.conf import settings
import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BasemapLayer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('icon', models.FileField(blank=True, null=True, upload_to='icons')),
                ('url', models.CharField(max_length=256)),
                ('type', models.CharField(choices=[('XYZ Tile', 'XYZ Tile'), ('WMS', 'WMS')], default='XYZ Tile', max_length=256)),
                ('dashboard_default', models.BooleanField(default=False, help_text='Is the basemap used as default on dashboard editor.')),
            ],
            options={
                'ordering': ('name',),
            },
        ),
        migrations.CreateModel(
            name='ContextLayer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('url', models.CharField(help_text="Can put full url with parameters and system will use that. Or system will use 'CONTEXT LAYER PARAMETERS' if there is no parameters on the url.", max_length=512)),
                ('url_legend', models.CharField(blank=True, max_length=256, null=True)),
                ('layer_type', models.CharField(choices=[('ARCGIS', 'ARCGIS'), ('Geojson', 'Geojson'), ('Raster Tile', 'Raster Tile')], default='ARCGIS', max_length=256)),
                ('token', models.CharField(blank=True, help_text='Token to access the layer', max_length=512, null=True)),
                ('username', models.CharField(blank=True, help_text='Username to access the layer', max_length=512, null=True)),
                ('password', models.CharField(blank=True, help_text='Password to access the layer', max_length=512, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ContextLayerGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Dashboard',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('slug', models.SlugField(max_length=512, unique=True)),
                ('icon', models.FileField(blank=True, null=True, upload_to='icons')),
                ('extent', django.contrib.gis.db.models.fields.PolygonField(blank=True, help_text='Extent of the dashboard. If empty, it is the whole map', null=True, srid=4326)),
                ('filters', models.TextField(blank=True, null=True)),
                ('basemap_layers', models.ManyToManyField(to='geosight_data.BasemapLayer')),
                ('context_layers', models.ManyToManyField(blank=True, to='geosight_data.ContextLayer')),
                ('creator', models.ForeignKey(help_text='User who create the dashboard.', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('default_basemap_layer', models.ForeignKey(blank=True, help_text='If this is empty, the default will be latest basemap', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='dashboard_default_basemap_layer', to='geosight_data.basemaplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Geometry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('identifier', models.CharField(max_length=512)),
                ('name', models.CharField(max_length=512)),
                ('geometry', django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326)),
                ('child_of', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='geometry_child_of', to='geosight_data.geometry')),
            ],
            options={
                'verbose_name_plural': 'geometries',
            },
        ),
        migrations.CreateModel(
            name='GeometryLevelName',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Indicator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('source', models.CharField(blank=True, max_length=512, null=True)),
                ('shortcode', models.CharField(blank=True, help_text='A computer-to-computer shortcode for this indicator. For example, an abbreviated name that you might use to refer to it in a spreadsheet column.', max_length=512, null=True)),
                ('reporting_level', models.CharField(max_length=64)),
                ('unit', models.CharField(blank=True, help_text="A unit e.g. 'cases', 'people', 'children', that will be shown alongside the number in reports.", max_length=64, null=True)),
                ('aggregation_behaviour', models.CharField(choices=[('Use all available populated geography in current time window', 'Current time window only'), ('Most recent for each geography', 'Most recent for each geography')], default='Most recent for each geography', max_length=256)),
                ('aggregation_method', models.CharField(choices=[('Aggregate data by average data in the levels.', 'Aggregate data by average data in the levels'), ('Aggregate data by majority data in the levels.', 'Aggregate data by majority data in the levels'), ('Aggregate data by sum all data.', 'Aggregate data by sum of all data in the levels')], default='Aggregate data by average data in the levels.', max_length=256)),
                ('min_value', models.FloatField(default=0, help_text='Minimum value for the indicator that can received', verbose_name='Minimum Value')),
                ('max_value', models.FloatField(default=100, help_text='Maximum value for the indicator that can received', verbose_name='Maximum Value')),
                ('dashboard_link', models.CharField(blank=True, help_text='A dashboard link can be any URL to e.g. a BI platform or another web site. This is optional, and when populated, a special icon will be shown next to the indicator which, when clicked, will open up this URL in a frame over the main map area.', max_length=1024, null=True)),
            ],
            options={
                'ordering': ('group__name', 'name'),
            },
        ),
        migrations.CreateModel(
            name='IndicatorFrequency',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('frequency', models.IntegerField(help_text='Frequency in days. This is used by harvester as a frequency to get new indicator data.')),
            ],
            options={
                'verbose_name_plural': 'indicator frequencies',
            },
        ),
        migrations.CreateModel(
            name='IndicatorGroup',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('dashboard_link', models.CharField(blank=True, help_text='Dashboard link of the indicator group.', max_length=1024, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Link',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('url', models.CharField(max_length=256)),
                ('is_public', models.BooleanField(default=True, help_text='Is the link available for public or just admin.')),
                ('order', models.IntegerField(default=0)),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='ReferenceLayer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('identifier', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('source', models.CharField(max_length=512)),
                ('last_update', models.DateField(default=datetime.datetime.today)),
                ('geometries', models.ManyToManyField(blank=True, to='geosight_data.Geometry')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Widget',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('description', models.TextField(blank=True, null=True)),
                ('unit', models.CharField(blank=True, help_text="A unit e.g. 'cases', 'people', 'children', that will be shown alongside the number in reports.", max_length=64, null=True)),
                ('property', models.CharField(help_text='Property key that will be used to calculate to plugin.', max_length=256)),
                ('property_2', models.CharField(blank=True, help_text='Second property that will be used for e.g: grouping.', max_length=256, null=True)),
                ('type', models.CharField(default='SummaryWidget', max_length=256)),
                ('operation', models.CharField(default='Sum', max_length=256)),
                ('layer_used', models.CharField(choices=[('Indicator', 'Indicator')], default='Indicator', max_length=256)),
                ('order', models.IntegerField(default=0)),
                ('context_layer', models.ForeignKey(blank=True, help_text='Use this layer when layer used is context layer.', null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.contextlayer')),
                ('dashboard', models.ForeignKey(help_text='Dashboard this plugin is used.', on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
                ('indicator', models.ForeignKey(blank=True, help_text='Use this layer when layer used is reference layer.', null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.indicator')),
            ],
            options={
                'ordering': ('order',),
            },
        ),
        migrations.CreateModel(
            name='IndicatorValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(help_text='The date of the value harvested.', verbose_name='Date')),
                ('geom_identifier', models.CharField(max_length=256)),
                ('value', models.FloatField()),
                ('indicator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicator')),
            ],
            options={
                'ordering': ('-date',),
                'unique_together': {('indicator', 'date', 'geom_identifier')},
            },
        ),
        migrations.AddField(
            model_name='indicator',
            name='frequency',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.indicatorfrequency'),
        ),
        migrations.AddField(
            model_name='indicator',
            name='group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.indicatorgroup'),
        ),
        migrations.AddField(
            model_name='geometry',
            name='geometry_level',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.geometrylevelname'),
        ),
        migrations.AddField(
            model_name='dashboard',
            name='indicators',
            field=models.ManyToManyField(to='geosight_data.Indicator'),
        ),
        migrations.AddField(
            model_name='dashboard',
            name='reference_layer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.referencelayer'),
        ),
        migrations.AddField(
            model_name='contextlayer',
            name='group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.contextlayergroup'),
        ),
        migrations.CreateModel(
            name='ReferenceLayerLevel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level', models.IntegerField()),
                ('level_name', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.geometrylevelname')),
                ('reference_layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.referencelayer')),
            ],
            options={
                'unique_together': {('reference_layer', 'level')},
            },
        ),
        migrations.CreateModel(
            name='IndicatorRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('rule', models.CharField(help_text='Use formula to create the rule and use x as the value.Example: x<100. It will replace x with the value and will check the condition.', max_length=256)),
                ('color', models.CharField(blank=True, help_text='Color of the rule', max_length=16, null=True)),
                ('indicator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicator')),
            ],
            options={
                'unique_together': {('indicator', 'name')},
            },
        ),
        migrations.CreateModel(
            name='IndicatorExtraValue',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of attribute', max_length=100)),
                ('value', models.TextField(default=True, help_text='The value of attribute', null=True)),
                ('indicator_value', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.indicatorvalue')),
            ],
            options={
                'unique_together': {('indicator_value', 'name')},
            },
        ),
        migrations.CreateModel(
            name='ContextLayerStyle',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of style', max_length=128)),
                ('value', models.CharField(blank=True, help_text='The value of style', max_length=1024, null=True)),
                ('icon', models.FileField(blank=True, help_text='The icon of the style', null=True, upload_to='')),
                ('context_layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.contextlayer')),
            ],
            options={
                'unique_together': {('context_layer', 'name')},
            },
        ),
        migrations.CreateModel(
            name='BasemapLayerParameter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='The name of parameter', max_length=128)),
                ('value', models.CharField(blank=True, help_text='The value of parameter', max_length=128, null=True)),
                ('basemap_layer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.basemaplayer')),
            ],
            options={
                'unique_together': {('basemap_layer', 'name')},
            },
        ),
    ]
