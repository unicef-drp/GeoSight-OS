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
__date__ = '02/05/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json

import pytz
from django.db import models
from django_celery_beat.models import CrontabSchedule
from django_tenants.models import TenantMixin, DomainMixin
from django_tenants.utils import tenant_context
from django_tenants_celery_beat.models import (
    TenantTimezoneMixin,
    PeriodicTaskTenantLinkMixin
)

from core.utils import create_superuser


class Tenant(TenantTimezoneMixin, TenantMixin):
    """Client name for the tenant."""

    auto_create_schema = True
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    responder_email = models.EmailField(
        max_length=254,
        null=True, blank=True,
        help_text='Email address who has response for this client'
    )

    def __str__(self):
        return self.name

    def save(self, verbosity=1, *args, **kwargs):
        """Save client."""
        created = not self.pk
        super().save(verbosity=verbosity, *args, **kwargs)
        self.create_superuser()

        # Create limitation if just created
        if created:
            self.prepare_limitation()

    def create_superuser(self):
        """Create superuser for this tenant."""
        with tenant_context(self):
            create_superuser(self)

    def prepare_limitation(self):
        """Create superuser for this tenant."""
        from geosight.tenants.models import BaseModelWithLimitation
        with tenant_context(self):
            for _class in BaseModelWithLimitation.child_classes():
                _class.get_limit_obj(_class)


class Domain(DomainMixin):
    """Client name for the tenant."""

    is_primary = models.BooleanField(default=True, db_index=True)

    @property
    def schema_name(self):
        """Return schema name of domain."""
        return self.tenant.schema_name


class PeriodicTaskTenantLink(PeriodicTaskTenantLinkMixin):
    """Model to link periodic tasks with tenant."""

    def save(self, *args, **kwargs):
        """Make PeriodicTask tenant-aware.

        Inserts correct `_schema_name` for `self.tenant` and into
        `self.periodic_task.headers`.
        If `self.periodic_task` uses a crontab schedule and the tenant timezone
        should be used, the crontab is adjusted to use the timezone of
        the tenant.
        """
        update_fields = ["headers"]

        headers = json.loads(self.periodic_task.headers)
        headers["_schema_name"] = self.tenant.schema_name
        self.use_tenant_timezone = headers.pop(
            "_use_tenant_timezone", self.use_tenant_timezone
        )
        self.periodic_task.headers = json.dumps(headers)

        if self.periodic_task.crontab is not None:
            task_tz = self.periodic_task.crontab.schedule.tz
            if not task_tz:
                task_tz = pytz.utc

            tz = self.tenant.timezone if self.use_tenant_timezone else task_tz
            schedule = self.periodic_task.crontab.schedule
            if schedule.tz != tz:
                schedule.tz = tz
                crontab = CrontabSchedule.from_schedule(schedule)
                if not crontab.id:
                    crontab.save()
                self.periodic_task.crontab = crontab
                update_fields.append("crontab")

        self.periodic_task.save(update_fields=update_fields)
        super(PeriodicTaskTenantLinkMixin, self).save(*args, **kwargs)
