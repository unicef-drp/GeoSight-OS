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

    def __init__(self, name, count):  # noqa: DOC101,DOC103
        """
        Initialize FixtureObjectInfo.

        :param name: Name of the object type.
        :type name: str
        :param count: Number of objects to be restored.
        :type count: int
        """
        self.name = name
        self.count = count


class FixtureTypeObject:
    """Fixture type object."""

    def __init__(  # noqa: DOC101,DOC103
            self, name, description, info: List[FixtureObjectInfo],
            command_name
    ):
        """
        Initialize FixtureTypeObject.

        :param name: Name of the fixture type.
        :type name: str
        :param description: Human-readable description of this fixture type.
        :type description: str
        :param info: List of object info entries describing what is restored.
        :type info: List[FixtureObjectInfo]
        :param command_name: Django management command name to run.
        :type command_name: str
        """
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

    is_kartoza_data_restored = models.BooleanField(
        default=False,
        help_text=_(
            'Indicates whether default data has been restored.'
        )
    )
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
        """
        Return True if data restoration is currently enabled.

        :return: True if restoration is enabled and no data exists yet
            and no active restore request is running.
        :rtype: bool
        """
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
        """State choices for a restore request."""

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

    class Meta:  # noqa: D106
        verbose_name_plural = "request restore data"

    def run(self):
        """
        Run the management command for the requested fixture type.

        Looks up the fixture type by ``data_type``, sets state to
        ``RUNNING``, executes the management command, then sets state
        to ``FINISH`` on success or ``FAILED`` on exception.
        Does nothing if restoration is currently disabled or if the
        ``data_type`` does not match any known fixture type.

        :return: None
        :rtype: None
        """
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
        try:
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
