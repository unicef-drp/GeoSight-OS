# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '02/04/2026'
__copyright__ = ('Copyright 2026, Unicef')

from typing import List

from django.db import models
from django.utils.translation import gettext_lazy as _

from core.models.color import ColorPalette
from core.models.singleton import SingletonModel
from geosight.data.models import (
    BasemapLayer, Indicator, Dashboard, ContextLayer, RelatedTable, Style
)


class FixtureObjectInfo:
    """Information of number of object that will be restored."""

    def __init__(self, name, count):
        self.name = name
        self.count = count


class FixtureTypeObject:
    """Fixture type object."""

    def __init__(
            self, name, description, info: List[FixtureObjectInfo],
            command_name
    ):
        self.name = name
        self.description = description
        self.info = info
        self.command_name = command_name


fixtures_types = (
    FixtureTypeObject(
        name='Default',
        description=(
            'This is the default data that just restored some core data.'
        ),
        info=[
            FixtureObjectInfo(name='Basemap', count=3),
            FixtureObjectInfo(name='Color palette', count=8),
            FixtureObjectInfo(name='Code list', count=3),
            FixtureObjectInfo(name='Style', count=1),
        ],
        command_name='load_default_data'
    ),
    FixtureTypeObject(
        name='Demo',
        description=(
            'Restore demo data focusing on Somalia and Kenya.'
        ),
        info=[
            FixtureObjectInfo(name='Basemap', count=3),
            FixtureObjectInfo(name='Color palette', count=8),
            FixtureObjectInfo(name='Code list', count=3),
            FixtureObjectInfo(name='Indicator', count=3),
            FixtureObjectInfo(name='Indicator data', count=1054),
            FixtureObjectInfo(name='Project', count=1),
            FixtureObjectInfo(name='Context layer', count=3),
            FixtureObjectInfo(name='Related tabel', count=1),
            FixtureObjectInfo(name='Related tabel data', count=296),
            FixtureObjectInfo(name='Reference Datasets', count=3),
            FixtureObjectInfo(name='User', count=3),
            FixtureObjectInfo(name='Style', count=1),
        ],
        command_name='load_demo_data'
    )
)


class Preferences(SingletonModel):
    """Preference settings specifically for restoring fixtures.

    Preference contains
    - enable_request
    """

    enable_request = models.BooleanField(
        default=True,
        help_text=_(
            'Enable request to restore fixture.'
            'It will be disabled if there is a color palette.'
        )
    )

    class Meta:  # noqa: D106
        verbose_name_plural = "preferences"

    @property
    def is_enabled(self):
        """Return True if enable_request is True."""
        if any(
                model.objects.exists()
                for model in [
                    ColorPalette, BasemapLayer,
                    Indicator, Dashboard, ContextLayer, RelatedTable, Style,
                ]
        ):
            return False
        if RequestRestoreData.objects.exclude(
                state__in=[
                    RequestRestoreData.State.CREATED.value,
                    RequestRestoreData.State.FAILED.value,
                ]
        ).count():
            return False
        return self.enable_request


class RequestRestoreData(models.Model):
    """Request to restore data."""

    class State(models.TextChoices):
        CREATED = 'created', _('Created')
        RUNNING = 'running', _('Running')
        FINISH = 'finish', _('Finish')
        FAILED = 'failed', _('Failed')

    data_type = models.CharField(
        max_length=255, choices=[
            (fixtures_type.name, fixtures_type.name) for fixtures_type in
            fixtures_types
        ]
    )
    state = models.CharField(
        max_length=20,
        choices=State.choices,
        default=State.CREATED
    )
    note = models.TextField(blank=True, default='')

    def run(self):
        """Run the command."""
        preferences = Preferences.load()
        if not preferences.is_enabled:
            return

        fixture_type = next(
            (f for f in fixtures_types if f.name == self.data_type), None
        )
        if not fixture_type:
            return

        self.state = self.State.RUNNING
        self.save()

        from django.core.management import call_command
        from django.db import transaction
        try:
            with transaction.atomic():
                call_command(fixture_type.command_name)
        except Exception as e:
            self.state = self.State.FAILED
            self.note = str(e)
            self.save()
            return

        self.state = self.State.FINISH
        self.save()

        preferences.enable_request = False
        preferences.save()
