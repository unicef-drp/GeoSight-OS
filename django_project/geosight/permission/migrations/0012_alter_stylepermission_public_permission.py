# Generated by Django 3.2.16 on 2023-10-10 06:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_permission', '0011_alter_stylepermission_public_permission'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stylepermission',
            name='public_permission',
            field=models.CharField(choices=[('None', 'None'), ('Read', 'Read')], default='None', max_length=16),
        ),
    ]
