# Generated by Django 3.2.16 on 2024-02-19 03:20

from django.db import migrations, models


def run(apps, schema_editor):
    DashboardBookmark = apps.get_model("geosight_data", "DashboardBookmark")
    for bookmark in DashboardBookmark.objects.all():
        bookmark.selected_indicator_layers = []
        if bookmark.selected_indicator_layer:
            bookmark.selected_indicator_layers = [
                bookmark.selected_indicator_layer.id
            ]
            bookmark.save()


class Migration(migrations.Migration):
    dependencies = [
        ('geosight_data', '0100_delete_indicatorvaluedataset'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboardbookmark',
            name='selected_indicator_layers',
            field=models.JSONField(blank=True, null=True, default=list),
        ),
        migrations.AddField(
            model_name='dashboardembed',
            name='selected_indicator_layers',
            field=models.JSONField(blank=True, default=list, null=True),
        ),
        migrations.RunPython(run, migrations.RunPython.noop),
    ]