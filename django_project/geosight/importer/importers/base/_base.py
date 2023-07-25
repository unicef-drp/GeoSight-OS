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

import traceback
from abc import ABC
from datetime import datetime, time, date
from typing import List

import pytz
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.utils.timezone import now

from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.models.importer_definition import ImportType
from geosight.importer.models.log import (
    ImporterLog, ImporterLogData, LogStatus
)

User = get_user_model()


class BaseImporter(ABC):
    """Abstract class for importer."""

    attributes = {}
    mapping = {}
    objects = {}

    def __init__(self, log: ImporterLog):
        """Init class."""
        self.objects = {}
        self.log = log
        self.importer = log.importer
        self.attributes = self.importer.attributes
        self.mapping = self.importer.mapping
        self.now_time = now()
        self.now_time = self.now_time.replace(microsecond=0)

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Attributes that needs to be saved on database.

        The value is the default value for the attribute.
        This will be used by importer.
        """
        raise NotImplemented()

    def after_import(self, success, note):
        """After import."""
        if success:
            if not self.log.importer.need_review:
                logs = self.log.importerlogdata_set.order_by('id')
                total = logs.count()
                for line_idx, log in enumerate(logs):
                    self._save_log_data_to_model(log)
                    if self.importer.import_type == ImportType.RELATED_TABLE:
                        self._update(
                            f'Save the data to be database {line_idx}/{total}',
                            progress=int((line_idx / total) * 50) + 50
                        )

        elif not success:
            error = (
                'Importing is failed. No data saved. '
                'Please see the data to check the error.'
            )
            if note:
                error += '\n' + note
            raise ImporterError(error)

    def run(self):
        """To run the process."""
        from geosight.data.models.context_layer import ContextLayerRequestError
        try:
            self.log.status = LogStatus.RUNNING
            self.log.save()
            self.check_attributes()
            self.log.importerlogdata_set.all().delete()
            success, note = self._process_data()

            # Use transaction atomic when indicator value
            if self.importer.import_type == ImportType.RELATED_TABLE:
                self.after_import(success, note)
            else:
                with transaction.atomic():
                    self.after_import(success, note)

            self._done(note)
        except (ImporterError, ContextLayerRequestError) as e:
            self._error(f'{e}')
        except Exception:
            self._error(
                f'{traceback.format_exc().replace(" File", "<br>File")}'
            )

    def get_attribute(self, key):
        """Return attribute by key."""
        return self.attributes.get(key, None)

    def check_attributes(self):
        """Check attributes definition."""
        for importer_attribute in self.__class__.attributes_definition():
            name = importer_attribute.name
            self.attributes[name] = importer_attribute.validate(
                self.get_attribute(name)
            )

    def _process_data(self) -> [bool, str]:
        """Run the harvester process."""
        raise NotImplemented()

    def _error(self, message: str):
        """Raise error and update log."""
        self.log.end_time = timezone.now()
        self.log.status = LogStatus.FAILED
        self.log.note = message
        self.log.save()

    def _done(self, message: str = ''):
        """Update log to done."""
        self.log.end_time = timezone.now()
        self.log.status = LogStatus.SUCCESS
        self.log.note = message
        self.log.progress = 100
        self.log.save()

    def _update(self, message: str = '', progress: int = None):
        """Update note for the log."""
        self.log.note = message
        if progress:
            self.log.progress = progress
        self.log.save()

    def _check_data_to_log(self, data: dict, note: dict) -> (dict, dict):
        """Save data that constructed from importer.

        :type data: dict
        :param data: Data that will be saved

        :type note: dict
        :param note: Note for each data

        :rtype (data, note): (dict, dict)
        """
        raise NotImplemented()

    def _save_data_to_log(self, data: dict, note: dict):
        """Save data to log."""
        data, note = self._check_data_to_log(data, note)
        for key, value in data.items():
            if value.__class__ in [date]:
                value = datetime.combine(value, datetime.min.time())
            if value.__class__ in [datetime, time]:
                value = value.replace(tzinfo=pytz.timezone(settings.TIME_ZONE))
                data[key] = value.timestamp()
        return ImporterLogData.objects.create(
            log=self.log,
            data=data,
            note=note
        )

    def _save_log_data_to_model(self, log_data: ImporterLogData):
        """Save data from log to actual model."""
        raise NotImplemented()

    def get_records(self) -> List:
        """Get records form upload session.

        Returning records and headers
        """
        raise NotImplemented
