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

from geosight.data.models.dashboard import Dashboard, DashboardRelationGroup


def to_structure(structure, group_list):
    """Group list to structure."""
    group_structure = None
    for child in structure['children']:
        try:
            if child['group'] == group_list[0]:
                group_structure = child
                if isinstance(group_list[1], int):
                    child['children'].append(group_list[1])
                else:
                    to_structure(child, group_list[1:])
                return
        except TypeError:
            pass
    if not group_structure:
        structure['children'].append({
            'group': group_list[0],
            'children': []
        })
        to_structure(structure, group_list)


def create_group_tree(group: DashboardRelationGroup):
    """Make group tree."""
    name = group.name.split('->')[0]
    if not group.group:
        return [name]
    else:
        return [name] + create_group_tree(group.group)


def return_structure(query, use_obj_id=False):
    """Return layer structure."""
    structure = {
        'group': '',
        'children': []
    }
    for layer in query.order_by('order'):
        id = layer.id
        if use_obj_id:
            id = layer.object.id
        if not layer.relation_group:
            structure['children'].append(id)
        else:
            group_list = [id] + create_group_tree(layer.relation_group)
            group_list.reverse()
            to_structure(structure, group_list)
    return structure


def run(apps, schema_editor):
    for dashboard in Dashboard.objects.all():
        dashboard.indicator_layers_structure = return_structure(
            dashboard.dashboardindicatorlayer_set.order_by('order')
        )
        dashboard.context_layers_structure = return_structure(
            dashboard.dashboardcontextlayer_set.order_by('order'),
            use_obj_id=True
        )
        dashboard.basemaps_layers_structure = return_structure(
            dashboard.dashboardbasemap_set.order_by('order'),
            use_obj_id=True
        )
        dashboard.widgets_structure = return_structure(
            dashboard.dashboardwidget_set.order_by('order')
        )
        dashboard.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0066_indicator_value_with_geo'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboard',
            name='indicator_layers_structure',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dashboard',
            name='context_layers_structure',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dashboard',
            name='basemaps_layers_structure',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dashboard',
            name='widgets_structure',
            field=models.JSONField(blank=True, null=True),
        ),
        # TODO:
        #  We can put it as django command
        # migrations.RunPython(run, migrations.RunPython.noop),
    ]
