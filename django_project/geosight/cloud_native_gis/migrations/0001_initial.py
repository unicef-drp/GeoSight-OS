# Generated by Django 3.2.16 on 2024-06-06 09:40

from django.db import migrations


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cloud_native_gis', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CloudNativeGISLayer',
            fields=[
            ],
            options={
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('cloud_native_gis.layer',),
        )
    ]