# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'andrewleblanc187@gmail.com'
__date__ = '20/10/2026'
__copyright__ = ('Copyright 2023, Unicef')

from uuid import uuid4

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.models.manager import PermissionManager

User = get_user_model()


class H3ReferenceLayerManager(models.Manager):
    """Manager returning only H3 reference layers."""

    def get_queryset(self):
        """Return queryset just for H3 reference layers."""
        return super().get_queryset().filter(is_h3=True)


class H3ReferenceLayerPermissionManager(PermissionManager):
    """Permission Manager returning only H3 reference layers."""

    def get_queryset(self):
        """Return queryset just for H3 reference layers."""
        return super().get_queryset().filter(is_h3=True)

    def create(self, user: User, **kwargs):
        """Create function with user."""
        kwargs.setdefault('identifier', H3ReferenceLayer.get_uuid())
        return super().create(user=user, **kwargs)


class H3ReferenceLayer(ReferenceLayerView):
    """Reference Layer backed by an H3 grid."""

    objects = H3ReferenceLayerManager()
    permissions = H3ReferenceLayerPermissionManager()

    class Meta:  # noqa: D106
        proxy = True
        app_label = 'geosight_h3grid'

    def save(self, *args, **kwargs):
        """Force H3 flags on save."""
        self.is_h3 = True
        self.in_georepo = False
        super().save(*args, **kwargs)

    @staticmethod
    def get_uuid():
        """Return a unique identifier for a new H3 layer."""
        uuid = str(uuid4())
        while ReferenceLayerView.objects.filter(identifier=uuid).exists():
            uuid = str(uuid4())
        return uuid


H3_RESOLUTION_VALIDATORS = [MinValueValidator(0), MaxValueValidator(15)]


class H3ReferenceLayerConfig(models.Model):
    """Resolution settings for an H3 reference layer."""

    reference_layer = models.OneToOneField(
        ReferenceLayerView,
        on_delete=models.CASCADE,
        related_name='h3_config'
    )
    default_resolution = models.PositiveSmallIntegerField(
        validators=H3_RESOLUTION_VALIDATORS
    )
    min_resolution = models.PositiveSmallIntegerField(
        validators=H3_RESOLUTION_VALIDATORS
    )
    max_resolution = models.PositiveSmallIntegerField(
        validators=H3_RESOLUTION_VALIDATORS
    )

    class Meta:  # noqa: D106
        app_label = 'geosight_h3grid'

    def clean(self):
        """Ensure min resolution <= default <= max resolution."""
        super().clean()
        if not (
            self.min_resolution
            <= self.default_resolution
            <= self.max_resolution
        ):
            raise ValidationError(
            'Resolutions must satisfy min <= default <= max'
            )
