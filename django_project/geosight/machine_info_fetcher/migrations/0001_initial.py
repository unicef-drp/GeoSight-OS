# Generated by Django 3.2.16 on 2024-10-22 07:12

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MachineInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_time', models.DateTimeField(auto_now_add=True)),
                ('source', models.CharField(help_text='Source of machine information, e.g: django.', max_length=255)),
                ('storage_log', models.TextField(blank=True, null=True)),
                ('memory_log', models.TextField(blank=True, null=True)),
            ],
        ),
    ]
