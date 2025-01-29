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
__date__ = '28/04/2024'
__copyright__ = ('Copyright 2023, Unicef')

from geosight.importer.models.log import ImporterLogDataSaveProgress
from geosight.importer.tasks import run_save_log_data


class RestartFunctions:
    """Class that contains some functions for restart."""

    def restart_log_sata_save_progress(self):
        """Restart harvester by removing running status and logs."""
        for progress in ImporterLogDataSaveProgress.objects.filter(done=False):
            run_save_log_data.delay(progress.id)
