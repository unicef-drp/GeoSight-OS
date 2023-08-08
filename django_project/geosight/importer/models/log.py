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

from django.contrib.gis.db import models
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _

from core.models.preferences import SitePreferences
from geosight.importer.models.importer import Importer


class LogStatus(object):
    """Quick access for coupling variable with Log status string."""

    START = 'Start'
    RUNNING = 'Running'
    FAILED = 'Failed'
    SUCCESS = 'Success'


class ImporterLog(models.Model):
    """History of Importer."""

    importer = models.ForeignKey(Importer, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    progress = models.IntegerField(default=0)
    status = models.CharField(
        max_length=100,
        choices=(
            (LogStatus.START, _(LogStatus.START)),
            (LogStatus.RUNNING, _(LogStatus.RUNNING)),
            (LogStatus.FAILED, _(LogStatus.FAILED)),
            (LogStatus.SUCCESS, _(LogStatus.SUCCESS)),
        ),
        default=LogStatus.START
    )
    note = models.TextField(blank=True, null=True)

    class Meta:  # noqa: D106
        ordering = ('-start_time',)

    def send_alert(self):
        """Send alert."""
        from geosight.importer.models.importer import ImporterAlert
        pref = SitePreferences.preferences()
        emails = []
        if self.status == LogStatus.START:
            emails = ImporterAlert.objects.filter(
                importer=self.importer,
                on_start=True
            ).values_list('email', flat=True)
        elif self.status == LogStatus.FAILED:
            emails = ImporterAlert.objects.filter(
                importer=self.importer,
                on_failure=True
            ).values_list('email', flat=True)
        elif self.status == LogStatus.SUCCESS:
            emails = ImporterAlert.objects.filter(
                importer=self.importer,
                on_success=True
            ).values_list('email', flat=True)

        # Send email
        if emails:
            log_url = reverse("admin-importer-log-detail-view", args=[self.pk])
            try:
                send_mail(
                    f'Importer {self.importer.unique_id} is {self.status}',
                    (
                        f'Importer {self.importer.unique_id} is {self.status}.'
                        f'Please check the log in {pref.site_url}{log_url}'
                    ),
                    None,
                    list(emails),
                    fail_silently=False,
                )
            except Exception:
                pass


class ImporterLogData(models.Model):
    """Data that is found on the importer.

    It will also be used for review one.
    When imported, delete the data.
    """

    log = models.ForeignKey(ImporterLog, on_delete=models.CASCADE)
    data = models.JSONField()
    note = models.JSONField(null=True)
    saved = models.BooleanField(
        default=False, help_text="Is the data saved to actual model."
    )

    @property
    def status(self):
        """Return status."""
        in_warning = False
        if self.note:
            note_keys = list(self.note.keys())
            try:
                note_keys.remove('warning')
                if not len(note_keys):
                    in_warning = True
            except ValueError:
                pass

        if self.saved:
            return 'Saved'
        elif in_warning:
            return 'Warning'
        elif self.note and self.note.keys():
            return 'Error'
        return 'Review'


class ImporterLogDataSaveProgress(models.Model):
    """Progress on saving data."""

    log = models.ForeignKey(ImporterLog, on_delete=models.CASCADE)
    target_ids = models.JSONField()
    saved_ids = models.JSONField(default=list)
    note = models.JSONField(null=True)
    done = models.BooleanField(default=False)

    def run(self):
        """Run the log."""
        log_datas = self.log.importerlogdata_set.filter(
            id__in=self.target_ids
        )
        importer = self.log.importer.importer(self.log)
        for log_data in log_datas:
            importer._save_log_data_to_model(log_data)
            self.saved_ids.append(log_data.id)
            self.save()
        self.delete()


@receiver(post_save, sender=ImporterLog, dispatch_uid="send_alert")
def send_alert(sender, instance: ImporterLog, **kwargs):
    """Send the alert."""
    if instance.importer.job:
        instance.send_alert()
