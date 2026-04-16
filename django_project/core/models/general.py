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
from django.db.models import OuterRef, Subquery
from django.db.models.fields.files import (
    FileField,
    ImageField,
    ImageFieldFile,
    FieldFile
)
from django.template.defaultfilters import slugify
from django.utils import timezone

User = get_user_model()

BASE_RESOURCE_FIELDS = (
    'creator', 'created_at', 'modified_by', 'modified_at',
    'creator_username', 'modified_by_username'
)
BASE_VERSIONED_RESOURCE_FIELDS = BASE_RESOURCE_FIELDS + ('version_data',)


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
        """Increase version by setting version_data to the current time."""
        self.version_data = timezone.now()
        self.save()

    @property
    def version(self):
        """Return version as a POSIX timestamp.

        :returns: POSIX timestamp of version_data.
        :rtype: float
        """
        return int(self.version_data.timestamp())

    def version_with_reference_layer_uuid(self, reference_layer_uuid):
        """Return version combined with a reference layer UUID.

        :param reference_layer_uuid: UUID of the reference layer.
        :type reference_layer_uuid: str
        :returns: Version string in the format ``<version>-<uuid>``.
        :rtype: str
        """
        return f'{self.version}-{reference_layer_uuid}'


class AbstractEditData(models.Model):
    """Abstract model with Time Editor."""

    creator = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)ss",
    )
    creator_username = models.CharField(
        max_length=255,
        null=True, blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    modified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="%(app_label)s_%(class)s_modified_by_related",
        related_query_name="%(app_label)s_%(class)ss",
    )
    modified_by_username = models.CharField(
        max_length=255,
        null=True, blank=True
    )
    modified_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:  # noqa: D106
        abstract = True

    def save(self, *args, **kwargs):  # noqa: DOC109, DOC101, DOC103, DOC201
        """Save any object to DB."""
        if not self.modified_by:
            self.modified_by = self.creator

        if self.creator:
            self.creator_username = self.creator.username
        if self.modified_by:
            self.modified_by_username = self.modified_by.username

        obj = super().save(*args, **kwargs)
        return obj

    @classmethod
    def batch_creator_username_assign(cls):
        """Batch assign creator to all objects."""
        cls.objects.filter(
            creator__isnull=False
        ).update(
            creator_username=Subquery(
                User.objects.filter(
                    id=OuterRef('creator_id')
                ).values('username')[:1]
            )
        )

    @classmethod
    def batch_modified_by_username_assign(cls):
        """Batch assign modified_by to all objects."""
        cls.objects.filter(
            modified_by__isnull=False
        ).update(
            modified_by_username=Subquery(
                User.objects.filter(
                    id=OuterRef('modified_by_id')
                ).values('username')[:1]
            )
        )


class SlugTerm(AbstractTerm):
    """Abstract model with term."""

    slug = models.SlugField(
        max_length=512, unique=True
    )

    def save(self, *args, **kwargs):  # noqa: DOC109, DOC101, DOC103, DOC201
        """Save model, auto-generating ``slug`` from ``name`` if not set."""
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)

    class Meta:  # noqa: D106
        abstract = True

    def name_is_exist(self, slug: str) -> bool:
        """Check whether a record with the given slug already exists.

        :param slug: Slug value to look up.
        :type slug: str
        :returns:
            ``True`` if another record with ``slug`` exists, else ``False``.
        :rtype: bool
        """
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
        """Delete a file from disk if it exists.

        Only acts when ``file_field`` is a
        :class:`~django.db.models.fields.files.FieldFile`
        or :class:`~django.db.models.fields.files.ImageFieldFile` instance.

        :param file_field: The file field value to delete.
        :type file_field: FieldFile or ImageFieldFile
        """
        if file_field and isinstance(file_field, (FieldFile, ImageFieldFile)):
            file_path = file_field.path
            if os.path.isfile(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    pass

    def save(self, *args, **kwargs):  # noqa: DOC109, DOC101, DOC103, DOC201
        """Delete replaced files before saving the new state.

        Iterates over all :class:`~django.db.models.FileField` and
        :class:`~django.db.models.ImageField` fields; if an existing file is
        replaced by a new one the old file is removed from disk.
        """
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

    def delete(self, *args, **kwargs):  # noqa: DOC109, DOC101, DOC103, DOC201
        """Delete all associated files from disk before removing the record."""
        for field in self._meta.get_fields():
            if isinstance(field, (FileField, ImageField)):
                self._delete_file(getattr(self, field.name, None))

        super().delete(*args, **kwargs)


class IconTerm(AbstractFileCleanup):
    """Abstract model contains icon."""

    icon = models.ImageField(
        upload_to='icons',
        null=True,
        blank=True
    )

    class Meta:  # noqa: D106
        abstract = True
