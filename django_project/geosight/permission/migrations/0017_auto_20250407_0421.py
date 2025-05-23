# Generated by Django 3.2.16 on 2025-04-07 04:21

from django.db import migrations, models
from geosight.permission.models.default import PERMISSIONS

class Migration(migrations.Migration):

    sql = f"""
    UPDATE geosight_permission_indicatorpermission 
    SET public_permission='{PERMISSIONS.READ_DATA.name}' 
    WHERE public_permission='{PERMISSIONS.READ.name}';
    """
    sql_default = f"""
    UPDATE geosight_permission_indicatorpermission 
    SET public_permission='{PERMISSIONS.READ.name}' 
    WHERE public_permission='{PERMISSIONS.READ_DATA.name}';
    """

    dependencies = [
        ('geosight_permission', '0016_groupmodelpermission_modified_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='indicatorgrouppermission',
            name='permission',
            field=models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Read Data', 'Read Data'), ('Write', 'Write'), ('Write Data', 'Write Data'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16),
        ),
        migrations.AlterField(
            model_name='indicatorpermission',
            name='public_permission',
            field=models.CharField(choices=[('None', 'None'), ('Read Data', 'Read Data')], default='None', max_length=16),
        ),
        migrations.AlterField(
            model_name='indicatoruserpermission',
            name='permission',
            field=models.CharField(choices=[('List', 'List'), ('Read', 'Read'), ('Read Data', 'Read Data'), ('Write', 'Write'), ('Write Data', 'Write Data'), ('Share', 'Share'), ('Owner', 'Owner')], default='List', max_length=16),
        ),
        migrations.RunSQL(sql, sql_default),
    ]
