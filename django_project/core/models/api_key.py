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
__date__ = '24/10/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from knox.models import AuthToken


class ApiKey(models.Model):
    """API Key class."""

    token = models.OneToOneField(
        AuthToken,
        on_delete=models.CASCADE,
        primary_key=True,
    )

    platform = models.CharField(
        null=True,
        blank=True,
        max_length=255
    )

    owner = models.CharField(
        null=True,
        blank=True,
        max_length=255
    )

    contact = models.CharField(
        null=True,
        blank=True,
        max_length=255
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:  # noqa: D106
        verbose_name = _("API Key")
        verbose_name_plural = _("API Keys")

    def __str__(self):
        return f'API Key for {self.token.user.email}'

    @property
    def expiry(self):
        """Return token."""
        return self.token.expiry


@receiver(post_delete, sender=ApiKey)
def api_key_on_delete(sender, instance, using, **kwargs):
    """Delete token when api key deleted."""
    instance.token.delete()
