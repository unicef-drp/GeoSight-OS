# Generated by Django 3.2.16 on 2025-04-29 08:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0121_auto_20250320_0750'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboard',
            name='filters_being_hidden',
            field=models.BooleanField(default=False),
        ),
    ]
