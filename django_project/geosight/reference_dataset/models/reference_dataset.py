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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.auth import get_user_model
from django.contrib.gis.db.models import QuerySet
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.permission.access import ResourcePermissionDenied
from geosight.permission.models.manager import PermissionManager
from geosight.permission.models.resource.reference_layer_view import (
    ReferenceLayerViewPermission
)

User = get_user_model()


class ReferenceDatasetLocalQuerySet(QuerySet):
    """Queryset specifically for local reference layer."""

    pass


class ReferenceDatasetPermissionManager(PermissionManager):
    """Reference layer view local manager."""

    def get_queryset(self):
        """Return queryset just for non georepo."""
        qs = ReferenceDatasetLocalQuerySet(self.model, using=self._db)
        return qs.filter(in_georepo=False)

    def create(self, user: User, **kwargs):
        """Create function with user."""
        try:
            kwargs['identifier']
        except KeyError:
            kwargs['identifier'] = ReferenceDataset.get_uuid()
        return super().create(user=user, **kwargs)


class ReferenceDataset(ReferenceLayerView):
    """Reference Layer view data."""

    objects = models.Manager()
    permissions = ReferenceDatasetPermissionManager()

    class Meta:  # noqa: D106
        proxy = True
        app_label = 'geosight_reference_dataset'

    def able_to_edit(self, user):
        """Able to edit."""
        if not user.is_authenticated or user != self.creator:
            raise ResourcePermissionDenied

    @property
    def levels(self):
        """Return level of reference layer."""
        return self.referencedatasetlevel_set.order_by('level')

    @staticmethod
    def get_uuid():
        """Return uuid of view."""
        from uuid import uuid4
        uuid = str(uuid4())
        if ReferenceLayerView.objects.filter(identifier=uuid).exists():
            return ReferenceLayerView.get_uuid()
        return uuid


class ReferenceDatasetLevel(models.Model):
    """Reference Layer view level."""

    reference_layer = models.ForeignKey(
        ReferenceDataset, on_delete=models.CASCADE
    )

    level = models.IntegerField()
    name = models.CharField(
        max_length=256,
        help_text=_("Level name.")
    )

    class Meta:  # noqa: D106
        unique_together = ('reference_layer', 'level')
        app_label = 'geosight_reference_dataset'

    def __str__(self):
        """Return str."""
        return f'{self.name} ({self.level})'


@receiver(post_save, sender=ReferenceDataset)
def create_resource(sender, instance, created, **kwargs):
    """When resource created."""
    if created:
        ReferenceLayerViewPermission.objects.create(obj=instance)


@receiver(post_save, sender=ReferenceDataset)
def save_resource(sender, instance, **kwargs):
    """When resource saved."""
    instance.permission.save()
