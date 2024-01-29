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
from django.db import models
from django.template.defaultfilters import slugify
from django.utils import timezone

User = get_user_model()


class AbstractTerm(models.Model):
    """Abstract model for Term."""

    name = models.CharField(
        max_length=512
    )
    description = models.TextField(
        null=True, blank=True
    )

    def __str__(self):
        return self.name

    class Meta:  # noqa: D106
        abstract = True


class AbstractSource(models.Model):
    """Abstract model with Source."""

    source = models.CharField(
        max_length=512,
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        abstract = True


class AbstractVersionData(models.Model):
    """Abstract model versioning data."""

    version_data = models.DateTimeField(default=timezone.now)

    class Meta:  # noqa: D106
        abstract = True

    def increase_version(self):
        """Increase version."""
        self.version_data = timezone.now()
        self.save()

    @property
    def version(self):
        """Return version data."""
        return int(self.version_data.timestamp())

    def version_with_reference_layer_uuid(self, reference_layer_uuid):
        """Return version data."""
        return f'{self.version}-{reference_layer_uuid}'


class AbstractEditData(models.Model):
    """Abstract model with Time Editor."""

    creator = models.ForeignKey(
        User, on_delete=models.CASCADE,
        null=True, blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:  # noqa: D106
        abstract = True


class SlugTerm(AbstractTerm):
    """Abstract model with term."""

    slug = models.SlugField(
        max_length=512, unique=True
    )

    def save(self, *args, **kwargs):
        """Save model."""
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)

    class Meta:  # noqa: D106
        abstract = True

    def name_is_exist(self, slug: str) -> bool:
        """Check of name is exist."""
        return self._meta.model.objects.exclude(pk=self.pk).filter(
            slug=slug
        ).first() is not None


class IconTerm(models.Model):
    """Abstract model contains icon."""

    icon = models.FileField(
        upload_to='icons',
        null=True,
        blank=True
    )

    class Meta:  # noqa: D106
        abstract = True
