import os
from django.conf import settings
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
    minimum = models.FloatField(null=True, blank=True)
    maximum = models.FloatField(null=True, blank=True)
    result = models.JSONField(null=True, blank=True, default=list)

    class Meta:
        unique_together = ('url', 'type', 'number', 'minimum', 'maximum')

    def save(self, *args, **kwargs):
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