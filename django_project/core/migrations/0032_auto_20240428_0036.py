# Generated by Django 3.2.16 on 2024-04-28 00:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0031_profile_manage_local_dataset'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitepreferences',
            name='activate_local_dataset',
            field=models.BooleanField(default=True, help_text='Activate feature to use local datasets alongside georepo.'),
        ),
        migrations.AlterField(
            model_name='sitepreferences',
            name='login_help_text',
            field=models.TextField(blank=True, default='', help_text='Help text to show in login page.', null=True),
        ),
    ]