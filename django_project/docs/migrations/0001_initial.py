# Generated by Django 3.2.16 on 2023-08-22 09:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Block',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.CharField(help_text='Relative url of documentation base url', max_length=128)),
                ('anchor', models.CharField(help_text='Anchor of block on the page on the documentation', max_length=128)),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='docs/icons')),
                ('title', models.CharField(blank=True, help_text='Title that will be used on the block. If not provided, it will use the title of the anchor on documentation page.', max_length=512, null=True)),
                ('description', models.TextField(blank=True, help_text='Description that will be used on the block. If not provided, it will use the first paragraph of the anchor on the documentation page.', null=True)),
            ],
            options={
                'ordering': ('anchor',),
            },
        ),
        migrations.CreateModel(
            name='Page',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Page name that will be used for frontend help center.', max_length=512, unique=True)),
                ('url', models.CharField(help_text='Relative url of documentation base url', max_length=128)),
                ('title', models.CharField(help_text='Title that will be used on the page.', max_length=512)),
                ('intro', models.TextField(blank=True, help_text='Help intro for this page.', null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Preferences',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('documentation_base_url', models.CharField(default='https://unicef-drp.github.io/GeoSight-OS', max_length=512)),
            ],
            options={
                'verbose_name_plural': 'preferences',
            },
        ),
        migrations.CreateModel(
            name='PageBlock',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('block', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='docs.block')),
                ('page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='docs.page')),
            ],
        ),
        migrations.CreateModel(
            name='BlockChild',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField(default=0)),
                ('child', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='block_children', to='docs.block')),
                ('parent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='docs.block')),
            ],
        ),
    ]
