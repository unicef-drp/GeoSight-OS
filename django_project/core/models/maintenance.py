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
__date__ = '28/11/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.utils import timezone

from django.contrib.auth import get_user_model
from django.db import models

from core.models.general import AbstractEditData

User = get_user_model()


class Maintenance(AbstractEditData):
    """Maintenance alert."""

    message = models.TextField(help_text='Alert for maintenance.')

    scheduled_from = models.DateTimeField(
        default=timezone.now,
        null=False,
        blank=False,
        help_text='Scheduled time from.'
    )

    scheduled_end = models.DateTimeField(
        null=True,
        blank=True,
        help_text=(
            'Scheduled time to. If empty, it will show forever.'
        )
    )

    def __str__(self):
        end = (
                " - " + self.scheduled_end.isoformat()
        ) if self.scheduled_end else ""
        return (
            'Maintenance scheduled at '
            f'{self.scheduled_from.isoformat()}'
            f'{end}'
        )
