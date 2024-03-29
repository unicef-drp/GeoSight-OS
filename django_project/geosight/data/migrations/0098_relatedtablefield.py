# Generated by Django 3.2.16 on 2024-01-30 04:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_data', '0097_auto_20240130_0430'),
    ]

    operations = [
        migrations.CreateModel(
            name='RelatedTableField',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('alias', models.CharField(max_length=512)),
                ('type', models.CharField(choices=[('number', 'Number'), ('string', 'String'), ('date', 'Date')], default='string', max_length=512)),
                ('related_table', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geosight_data.relatedtable')),
            ],
            options={
                'unique_together': {('related_table', 'name')},
            },
        ),
    ]
