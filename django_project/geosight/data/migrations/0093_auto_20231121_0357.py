# Generated by Django 3.2.16 on 2023-11-21 03:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0092_auto_20231121_0205'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='arcgisconfig',
            options={'ordering': ('name',)},
        ),
        migrations.AlterField(
            model_name='arcgisconfig',
            name='message',
            field=models.TextField(blank=True, help_text='Message when generate token error.', null=True),
        ),
    ]
