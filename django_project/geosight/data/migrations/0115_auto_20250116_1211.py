# Generated by Django 3.2.16 on 2025-01-16 12:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0114_auto_20250114_0329'),
    ]

    operations = [
        migrations.AlterField(
            model_name='basemaplayer',
            name='icon',
            field=models.ImageField(blank=True, null=True, upload_to='icons'),
        ),
        migrations.AlterField(
            model_name='dashboard',
            name='icon',
            field=models.ImageField(blank=True, null=True, upload_to='icons'),
        ),
    ]
