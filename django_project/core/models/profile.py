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

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.core.signing import BadSignature
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from azure_auth.backends import AzureAuthBackend
from geosight.permission.models import PermissionDetail, PERMISSIONS_LENGTH

User = get_user_model()


class RoleDoesNotFound(Exception):
    """Exception that is thrown when role does not found."""

    pass


class ROLES:
    """Roles list."""

    VIEWER = PermissionDetail('Viewer', 1)
    CONTRIBUTOR = PermissionDetail('Contributor', 2)
    CREATOR = PermissionDetail('Creator', 3)
    SUPER_ADMIN = PermissionDetail('Super Admin', 4)

    def get_level(self, name: str):
        """Return level by name."""
        try:
            return getattr(self, name.upper().replace(' ', '_')).level
        except AttributeError:
            return -1

    def get_user_level(self, user: User):
        """Return level by user role."""
        if user.is_superuser or user.is_staff:
            return self.get_level(self.SUPER_ADMIN.name)
        try:
            return self.get_level(user.profile.role)
        except AttributeError:
            return self.get_level(self.VIEWER.name)


ROLE_DEFAULT = ROLES.CREATOR.name

ROLES_TYPES = [
    (ROLES.VIEWER.name, ROLES.VIEWER.name),
    (ROLES.CONTRIBUTOR.name, ROLES.CONTRIBUTOR.name),
    (ROLES.CREATOR.name, ROLES.CREATOR.name),
    (ROLES.SUPER_ADMIN.name, ROLES.SUPER_ADMIN.name),
]


class Profile(models.Model):
    """Extension of User."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE
    )
    role = models.CharField(
        max_length=PERMISSIONS_LENGTH,
        choices=ROLES_TYPES,
        default=ROLE_DEFAULT
    )
    georepo_api_key = models.CharField(
        max_length=512,
        blank=True,
        null=True
    )
    receive_notification = models.BooleanField(
        default=False,
        help_text='Designates whether the user receive notification.'
    )
    manage_local_dataset = models.BooleanField(
        default=False,
        help_text='Designates whether the user able to manage local dataset.'
    )

    def __str__(self):
        """Str name of profile."""
        return self.role

    @staticmethod
    def update_role(user: User, role: str):
        """When user role."""
        profile, created = Profile.objects.get_or_create(user=user)
        if role not in [
            ROLES.SUPER_ADMIN.name, ROLES.CREATOR.name, ROLES.CONTRIBUTOR.name,
            ROLES.VIEWER.name
        ]:
            raise RoleDoesNotFound()
        profile.role = role
        profile.save()

    @property
    def able_to_manage_local_dataset(self):
        """Return if user is admin or not."""
        return self.is_admin or self.manage_local_dataset

    @property
    def is_admin(self):
        """Return if user is admin or not."""
        return self.role == ROLES.SUPER_ADMIN.name or self.user.is_superuser \
            or self.user.is_staff  # noqa: E127

    @property
    def is_creator(self):
        """Return if user is creator or not."""
        return self.role in [
            ROLES.SUPER_ADMIN.name, ROLES.CREATOR.name
        ] or self.user.is_superuser or self.user.is_staff

    @property
    def is_contributor(self):
        """Return if user is contributor or not."""
        return self.role in [
            ROLES.SUPER_ADMIN.name, ROLES.CREATOR.name, ROLES.CONTRIBUTOR.name
        ] or self.user.is_superuser or self.user.is_staff

    @property
    def georepo_api_key_val(self):
        """Return georepo api key user."""
        try:
            return signing.loads(self.georepo_api_key)
        except (TypeError, BadSignature):
            return ''


@receiver(pre_save, sender=User)
def username_same_with_email(sender, instance, **kwargs):
    """When user saved and use azure, username should be same with email."""
    if settings.USE_AZURE:
        if instance.username != instance.email:
            instance.email = AzureAuthBackend.clean_user_email(instance.email)
            instance.username = instance.email


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """When user created."""
    if created:
        Profile.objects.create(user=instance)
    instance.profile.save()


@receiver(pre_save, sender=Profile)
def post_profile_saved(sender, instance, **kwargs):
    """When profile saved, check if it's already profile on it.

    If yes, user that profile.
    """
    if instance.is_admin:
        instance.manage_local_dataset = True
    if not instance.id:
        try:
            profile = Profile.objects.get(user=instance.user)
            instance.id = profile.id
            instance.pk = profile.pk
        except Profile.DoesNotExist:
            pass
