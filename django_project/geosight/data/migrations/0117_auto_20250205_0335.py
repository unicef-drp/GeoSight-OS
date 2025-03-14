# Generated by Django 3.2.16 on 2025-02-05 03:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_georepo', '0021_auto_20250203_0549'),
        ('geosight_data', '0116_cogclassification'),
    ]

    operations = [
        migrations.AddField(
            model_name='indicatorvalue',
            name='entity',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='geosight_georepo.entity'),
        ),
        migrations.AddIndex(
            model_name='indicatorvalue',
            index=models.Index(fields=['indicator', 'entity'], name='geosight_da_indicat_f8601a_idx'),
        ),
    ]
