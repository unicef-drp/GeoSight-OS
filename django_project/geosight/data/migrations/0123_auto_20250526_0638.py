# Generated by Django 3.2.16 on 2025-05-26 06:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0122_dashboard_filters_being_hidden'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboardbookmark',
            name='context_layers_config',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='dashboardembed',
            name='context_layers_config',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
