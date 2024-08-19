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
__date__ = '19/08/2024'
__copyright__ = ('Copyright 2023, Unicef')

from typing import Optional

from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.db import models
from django.db import connection

from tenants.models.tenant import Client


class AlreadyReachTheLimit(Exception):
    """Exception for the model already reach the limit."""

    def __init__(self):
        """init."""
        super().__init__(
            'Limit has been reached, '
            'please change the limit by upgrade it.'
        )


class ModelDataLimitation(models.Model):
    """Model data limitation."""

    tenant = models.ForeignKey(
        Client, on_delete=models.CASCADE
    )
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE
    )
    model_field_group = models.CharField(
        max_length=126,
        help_text=(
            'The model field group that will be used to group the limitation. '
            'e.g: Limit a Model by the field group. '
            'If it is empty, it will limit all of data.'
        ),
        null=True, blank=True
    )
    limit = models.IntegerField(
        null=True,
        blank=True,
        help_text='Limit of data allowed to the content_type.'
    )
    description = models.TextField(
        null=True,
        blank=True
    )

    class Meta:  # noqa: D106
        ordering = ('content_type',)
        unique_together = ('content_type', 'model_field_group')

    def update_limit(self, new_limit: int):
        """Update the limit."""
        self.limit = new_limit
        self.save()


class BaseModelWithLimitation(models.Model):
    """Abstract base model with limitations."""

    limit_by_field_name = None

    @staticmethod
    def get_limit_obj(cls) -> ModelDataLimitation:
        """Get limit of the class."""
        # We check the limitation before saving.
        tenant = connection.get_tenant()
        data, _ = ModelDataLimitation.objects.get_or_create(
            tenant=tenant,
            model_field_group=cls.limit_by_field_name,
            content_type=ContentType.objects.get_for_model(cls)
        )
        return data

    @staticmethod
    def get_limit(cls) -> Optional[int]:
        """Get limitation.

        :return int limitation: The limit of model.
        """
        return cls.get_limit_obj(cls).limit

    @staticmethod
    def cls_model_data_count(cls):
        """Data count for the class."""
        if cls.limit_by_field_name:
            raise AttributeError(
                "Can't use this static method because "
                "it has limit_by_field_name. "
                "Please use the model_data_count method of an instance."
            )
        return cls.objects.filter().count()

    def save(self, *args, **kwargs):
        """Save model."""
        if not self.pk:
            if self.has_reach_limit:
                raise AlreadyReachTheLimit()
        return super().save(*args, **kwargs)

    @property
    def model_data_count(self):
        """Data count."""
        if not self.limit_by_field_name:
            return self.__class__.cls_model_data_count(self.__class__)

        limit_filter = getattr(self, self.limit_by_field_name)
        return self.__class__.objects.filter(
            **{f"{self.limit_by_field_name}": getattr(self, limit_filter)}
        ).count()

    @property
    def has_reach_limit(self) -> bool:
        """Check if it is reach limit."""
        limit = self.__class__.get_limit(self.__class__)
        if not limit:
            return False
        return limit <= self.model_data_count

    class Meta:  # noqa: D106
        abstract = True
