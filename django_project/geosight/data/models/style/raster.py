# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '16/02/2025'
__copyright__ = ('Copyright 2025, Unicef')

import os
from django.contrib.gis.db import models
from geosight.data.utils import (
    download_file_from_url,
    ClassifyRasterData
)
from geosight.data.models.style.base import (
    DynamicClassificationTypeChoices,
    DynamicClassificationType
)


class COGClassification(models.Model):
    """Model to store COG pixel classification."""

    url = models.URLField(null=True, blank=False)
    type = models.CharField(
        choices=DynamicClassificationTypeChoices,
        null=False,
        blank=False,
        default=DynamicClassificationType.EQUIDISTANT,
        max_length=30
    )
    number = models.IntegerField(null=True, blank=False, default=7)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    result = models.JSONField(null=True, blank=True, default=list)

    class Meta:  # noqa: D106
        unique_together = ('url', 'type', 'number', 'min_value', 'max_value')

    def save(self, *args, **kwargs):
        """Save COG Classification."""
        if len(self.result) == 0:
            retry = 0
            success = False
            tmp_file_path = None
            while retry < 3:
                try:
                    tmp_file_path = download_file_from_url(self.url)
                except Exception as e:
                    print(e)
                    retry += 1
                else:
                    success = True
                    retry = 3
            if retry == 3 and not success:
                raise RuntimeError('Failed to download file!')

            classification = ClassifyRasterData(
                raster_path=tmp_file_path,
                class_type=self.type,
                class_num=self.number,
                minimum=self.minimum,
                maximum=self.maximum
            ).run()
            os.remove(tmp_file_path)
            self.result = [float(a) for a in classification]

        super(COGClassification, self).save(*args, **kwargs)
