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

import json
import uuid

from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.db.models import Q
from django.shortcuts import reverse
from django.utils.translation import ugettext_lazy as _
from django_celery_beat.models import PeriodicTask, CrontabSchedule

from core.models.general import AbstractEditData
from core.models.profile import ROLES
from geosight.georepo.models import ReferenceLayerView
from .importer_definition import (
    ImporterClass, InputFormat, ImportType, ScheduleType
)

User = get_user_model()


class Importer(AbstractEditData):
    """Data importer model."""

    unique_id = models.UUIDField(
        default=uuid.uuid4, editable=False
    )
    import_type = models.CharField(
        max_length=128,
        default=ImportType.RELATED_TABLE,
        choices=(
            (ImportType.RELATED_TABLE, ImportType.RELATED_TABLE),
            (ImportType.INDICATOR_VALUE, ImportType.INDICATOR_VALUE),
        ),
        help_text=_(
            "Type of data that will be saved. "
            "It is between indicator value or related table."
        )
    )
    input_format = models.CharField(
        max_length=128,
        default=InputFormat.EXCEL_WIDE,
        choices=(
            (InputFormat.EXCEL_WIDE, InputFormat.EXCEL_WIDE),
            (InputFormat.EXCEL_LONG, InputFormat.EXCEL_LONG),
            (
                InputFormat.SHAREPOINT_EXCEL_WIDE,
                InputFormat.SHAREPOINT_EXCEL_WIDE
            ),
            (
                InputFormat.SHAREPOINT_EXCEL_LONG,
                InputFormat.SHAREPOINT_EXCEL_LONG
            ),
            (
                InputFormat.API_WITH_GEOGRAPHY_WIDE,
                InputFormat.API_WITH_GEOGRAPHY_WIDE
            ),
            (
                InputFormat.API_WITH_GEOGRAPHY_LONG,
                InputFormat.API_WITH_GEOGRAPHY_LONG
            ),
            (
                InputFormat.VECTOR_CONTEXT_LAYER,
                InputFormat.VECTOR_CONTEXT_LAYER,
            ),
            (
                InputFormat.RELATED_TABLE_LAYER,
                InputFormat.RELATED_TABLE_LAYER,
            ),
            (
                InputFormat.FORMULA_BASED_ON_OTHER_INDICATORS,
                InputFormat.FORMULA_BASED_ON_OTHER_INDICATORS,
            ),
            (InputFormat.SDMX, InputFormat.SDMX),
        ),
        help_text=_(
            "Format of input. "
            "It will used for deciding what importer will be used."
        )
    )
    reference_layer = models.ForeignKey(
        ReferenceLayerView,
        help_text=_('Reference layer.'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # The code type of data
    DEFAULT_ADMIN_CODE_TYPE = 'ucode'
    admin_code_type = models.CharField(
        max_length=512, null=True, blank=True,
        default=DEFAULT_ADMIN_CODE_TYPE,
        help_text=_('The code type of the data.'),
    )

    # Schedule data
    job = models.OneToOneField(
        PeriodicTask,
        help_text=_('Scheduled task for the importer.'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    job_name = models.CharField(
        max_length=512, null=True, blank=True
    )
    run_on_create = models.BooleanField(default=True)

    def __str__(self):
        if self.job_name:
            return self.job_name
        return self.unique_name

    def able_to_edit(self, user):
        """If able to edit."""
        return user.profile.role == ROLES.SUPER_ADMIN.name or \
            user == self.creator

    @property
    def unique_name(self):
        """Return unique name."""
        return (
            f'{self.creator.username} '
            f'({self.created_at.strftime("%Y-%m-%d %H:%M:%S")})'
        )

    def save(self, *args, **kwargs):
        """Override importer saved."""
        # Keep this to check the importer
        self.importer  # noqa: D106
        super(Importer, self).save(*args, **kwargs)

    @property
    def importer(self):
        """Return the importer."""
        return ImporterClass(
            import_type=self.import_type, input_format=self.input_format
        ).get()

    def save_attribute(self, name, value=None, file=None):
        """Save single attribute."""
        from geosight.importer.models.attribute import ImporterAttribute
        if not value and not file:
            attr, _ = ImporterAttribute.objects.get_or_create(
                importer=self, name=name
            )
            attr.value = value
            attr.file = file
            attr.save()

    def save_attributes(self, data, files, **kwargs):
        """Save attributes for the importers."""
        from geosight.importer.models.attribute import (
            ImporterAttribute, ImporterMapping
        )
        from geosight.importer.exception import ImporterError
        from geosight.importer.attribute import ImporterAttributeInputType

        self.importerattribute_set.all().delete()
        for importer_attr in self.importer.attributes_definition(**kwargs):
            name = importer_attr.name
            value = None
            file = None
            # Saved based on data
            try:
                if importer_attr.input_type == ImporterAttributeInputType.FILE:
                    file = files[
                        name] if importer_attr.required else data.get(
                        name, None
                    )
                else:
                    if importer_attr.default_value is not None:
                        data[name] = data.get(
                            name, importer_attr.default_value
                        )
                    value = data[
                        name] if importer_attr.required else data.get(
                        name, None
                    )
            except KeyError as e:
                raise ImporterError(f'{e} is required')

            # Skip save if no data
            if value is not None or file is not None:
                attr, _ = ImporterAttribute.objects.get_or_create(
                    importer=self, name=name
                )
                attr.value = value
                attr.file = file
                attr.save()

        # Save mapping
        self.importermapping_set.all().delete()
        for key, value in data.get('mapping', {}).items():
            ImporterMapping.objects.get_or_create(
                importer=self,
                name=key,
                value=value
            )

        # Save alerts
        self.importeralert_set.all().delete()
        for alert in data.get('alerts', []):
            if alert['email']:
                ImporterAlert.objects.get_or_create(
                    importer=self,
                    email=alert['email'],
                    defaults={
                        'on_start': alert['on_start'],
                        'on_success': alert['on_success'],
                        'on_failure': alert['on_failure'],
                    }
                )

    @property
    def attributes(self):
        """Return attributes of data."""
        reference_layer_id = None
        if self.reference_layer:
            reference_layer_id = self.reference_layer.id

        attrs = {
            'reference_layer_id': reference_layer_id
        }
        for attr in self.importerattribute_set.all():
            attrs[attr.name] = attr.file if attr.file else attr.value
        return attrs

    @property
    def mapping(self):
        """Return mapping of data."""
        attrs = {}
        for attr in self.importermapping_set.all():
            attrs[attr.name] = attr.value
        return attrs

    def post_saved(self, force=False) -> str:
        """Post save importer data.

        Return redirect url.
        """
        from geosight.importer.models import ImporterLog
        from geosight.importer.tasks import run_importer

        # Run right after save if single import
        if self.run_on_create or force:
            if not self.running_log:
                log = ImporterLog.objects.create(importer=self)
                run_importer.delay(self.id, log.id)
                return reverse('admin-importer-log-detail-view', args=[log.id])
            return ''

        elif self.job:
            # TODO:
            #  Return the detail page of job
            return reverse(
                'admin-data-management-list-view') + '#Scheduled Jobs'
        return reverse('admin-data-management-list-view') + '#Logs'

    # For run importer
    @property
    def running_log(self):
        """Return importer class of indicator."""
        from geosight.importer.models.log import LogStatus
        return self.importerlog_set.filter(
            Q(status=LogStatus.START) |
            Q(status=LogStatus.RUNNING)
        ).first()

    def run(self, log=None):
        """Run the importer.

        Check if it can run.
        """
        from geosight.importer.models import ImporterLog
        if not log and not self.running_log:
            log = ImporterLog.objects.create(importer=self)
            self.importer(log).run()
        elif log:
            self.importer(log).run()

    # --------------------------------------------------
    # FUNCTIONS FOR SCHEDULE JOB
    # --------------------------------------------------
    @property
    def schedule(self):
        """Return schedule of job."""
        return self.job.crontab.__str__().replace('(m/h/dM/MY/d) ', '') \
            if self.job else None

    @property
    def job_active(self):
        """Return the importer."""
        return None if not self.job else self.job.enabled

    def enable_job(self):
        """Enable job."""
        self.job.enabled = True
        self.job.save()

    def disable_job(self):
        """Disabled job."""
        self.job.enabled = False
        self.job.save()

    def change_job(self, schedule: str):
        """Change the job."""
        from geosight.importer.exception import ImporterError
        if schedule:
            if not self.job_name:
                raise ImporterError('Job name is required')
            schedules = schedule.split(' ')
            if len(schedules) != 6:
                raise ImporterError('Schedule is not in <* * * * * *> format')
            timezone = schedules[5]
            if timezone == '*':
                timezone = 'UTC'
            crontab = CrontabSchedule(
                minute=schedules[0],
                hour=schedules[1],
                day_of_month=schedules[2],
                month_of_year=schedules[3],
                day_of_week=schedules[4],
                timezone=timezone
            )

            kwargs = json.dumps({"_id": self.id})
            # If not same, delete old one, and replace with new contrab
            if self.job and self.schedule != crontab.__str__():
                job = self.job
                job.crontab.minute = crontab.minute
                job.crontab.hour = crontab.hour
                job.crontab.day_of_month = crontab.day_of_month
                job.crontab.month_of_year = crontab.month_of_year
                job.crontab.day_of_week = crontab.day_of_week
                job.crontab.timezone = crontab.timezone
                job.crontab.save()
                self.save()
                job.kwargs = kwargs
                job.save()

            elif not self.job:
                try:
                    crontab.save()
                except Exception as e:
                    raise ImporterError(f'{e}')
                self.job = PeriodicTask.objects.create(
                    name=self.unique_name,
                    task='geosight.importer.tasks.run_importer',
                    kwargs=kwargs,
                    crontab=crontab
                )
                self.job.save()
                self.save()
        else:
            if self.job:
                self.job.crontab.delete()
                self.job.delete()
            self.job_name = None
            self.save()

    @property
    def schedule_type(self):
        """Return the importer."""
        return ScheduleType.SINGLE_IMPORT \
            if not self.job else ScheduleType.SCHEDULED_IMPORT

    @property
    def need_review(self):
        """Return if the data is still in review."""
        from geosight.importer.models.log import ImporterLogData
        if self.import_type == ImportType.INDICATOR_VALUE:
            if not ImporterLogData.objects.filter(
                    log__importer=self, saved=True).count():
                return True
            elif not self.job:
                return True
        return False


class ImporterAlert(models.Model):
    """Alert data for the importer."""

    importer = models.ForeignKey(Importer, on_delete=models.CASCADE)
    email = models.CharField(max_length=512)
    on_start = models.BooleanField(default=False)
    on_success = models.BooleanField(default=False)
    on_failure = models.BooleanField(default=False)

    class Meta:  # noqa: D106
        unique_together = ('importer', 'email')
