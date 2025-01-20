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

import os

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.fields.files import (
    FileField,
    ImageField,
    ImageFieldFile,
    FieldFile
)
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
        return self.version_data.timestamp()

    def version_with_reference_layer_uuid(self, reference_layer_uuid):
        """Return version data."""
        return f'{self.version}-{reference_layer_uuid}'


class AbstractEditData(models.Model):
    """Abstract model with Time Editor."""

    creator = models.ForeignKey(
        User, on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)ss",
    )
    created_at = models.DateTimeField(default=timezone.now)
    modified_by = models.ForeignKey(
        User, on_delete=models.CASCADE,
        null=True, blank=True,
        related_name="%(app_label)s_%(class)s_modified_by_related",
        related_query_name="%(app_label)s_%(class)ss",
    )
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:  # noqa: D106
        abstract = True

    def save(self, *args, **kwargs):
        """
        Save any object to DB.

        This will also add modified_by if it does not have any.
        """
        if not self.modified_by:
            self.modified_by = self.creator
        obj = super().save(*args, **kwargs)
        return obj


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


class AbstractFileCleanup(models.Model):
    """A mixin to automatically delete old files.

    It will be done when a new file is set or the object
    is deleted. Works for both FileField and ImageField.
    """

    class Meta:  # noqa: D106
        abstract = True

    def _delete_file(self, file_field):
        """Delete a file if the field is FieldFile or ImageFieldFile."""
        if file_field and isinstance(file_field, (FieldFile, ImageFieldFile)):
            file_path = file_field.path
            if os.path.isfile(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    pass

    def save(self, *args, **kwargs):
        """Check for old file before saving."""
        for field in self._meta.get_fields():
            if isinstance(field, (FileField, ImageField)):
                old_file = None
                if self.pk:  # Check if the instance already exists
                    try:
                        old_file = getattr(
                            self.__class__.objects.get(pk=self.pk),
                            field.name
                        )
                    except self.__class__.DoesNotExist:
                        pass
                new_file = getattr(self, field.name, None)
                if old_file and old_file.name and old_file != new_file:
                    self._delete_file(old_file)

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Delete associated files before deleting the object."""
        for field in self._meta.get_fields():
            if isinstance(field, (FileField, ImageField)):
                self._delete_file(getattr(self, field.name, None))

        super().delete(*args, **kwargs)


class IconTerm(AbstractFileCleanup):
    """Abstract model contains icon."""

    icon = models.FileField(
        upload_to='icons',
        null=True,
        blank=True
    )

    class Meta:  # noqa: D106
        abstract = True
