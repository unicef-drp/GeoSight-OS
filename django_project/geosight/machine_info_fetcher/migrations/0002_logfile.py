# Generated by Django 3.2.16 on 2024-11-12 16:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geosight_machine_info_fetcher', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='LogFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('path', models.CharField(max_length=500, unique=True)),
                ('size', models.PositiveBigIntegerField()),
                ('created_on', models.DateTimeField()),
            ],
        ),
    ]