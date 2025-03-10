# Generated by Django 3.2.16 on 2024-12-30 04:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0112_alter_context_layer'),
    ]

    operations = [
        migrations.CreateModel(
            name='IndicatorValueDataset',
            fields=[
                ('id', models.CharField(max_length=256, primary_key=True, serialize=False)),
                ('indicator_id', models.BigIntegerField()),
                ('reference_layer_id', models.UUIDField()),
                ('admin_level', models.CharField(max_length=256)),
                ('data_count', models.IntegerField(blank=True, null=True)),
                ('start_date', models.DateField(blank=True, null=True)),
                ('end_date', models.DateField(blank=True, null=True)),
                ('reference_layer_uuid', models.UUIDField()),
                ('reference_layer_name', models.CharField(blank=True, max_length=256, null=True)),
                ('indicator_name', models.CharField(blank=True, max_length=256, null=True)),
                ('indicator_shortcode', models.CharField(blank=True, max_length=256, null=True)),
                ('identifier', models.CharField(blank=True, max_length=256, null=True)),
            ],
            options={
                'db_table': 'no_table',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='DashboardTool',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('visible_by_default', models.BooleanField(default=False)),
                ('group', models.CharField(blank=True, max_length=512, null=True)),
                ('name', models.CharField(choices=[('3D view', '3D view'), ('Compare layers', 'Compare layers'), ('Measurement', 'Measurement'), ('Zonal analysis', 'Zonal analysis')], max_length=255)),
                ('config', models.JSONField(blank=True, null=True)),
                ('dashboard', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.dashboard')),
                ('relation_group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_data.dashboardrelationgroup')),
            ],
            options={
                'ordering': ('name',),
                'unique_together': {('name', 'dashboard')},
            },
        ),
    ]
