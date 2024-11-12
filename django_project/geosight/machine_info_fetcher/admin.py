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
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os
import mimetypes
from datetime import datetime
from django.conf import settings
from django.contrib import admin, messages
from django.urls import re_path, reverse
from django.http import (
    HttpResponseRedirect,
    HttpResponse,
    Http404,
    FileResponse
)
from django.utils.html import format_html

from geosight.machine_info_fetcher.models import MachineInfo, LogFile


def list_log_files(parent_dir):
    """Get list of log files from parent_dir."""
    log_files = []
    for root, dirs, files in os.walk(parent_dir):
        for file in files:
            if ".log" in file:
                file_path = os.path.join(root, file)
                file_size = os.path.getsize(file_path)
                created_on = datetime.fromtimestamp(
                    os.path.getctime(file_path)
                ).strftime('%Y-%m-%d %H:%M:%S')
                log_files.append((file_path, file_size, created_on))
    return log_files


class LogFileAdmin(admin.ModelAdmin):
    """Class that represents LogFile Admin."""

    list_display = (
        'filename', 'size', 'created_on', 'download_link')
    actions = ['refresh_log_files']

    def download_link(self, obj):
        """Get download link for LogFile."""
        return format_html(
            '<a href="{}">Download</a>',
            reverse('admin:dashboard_download_log_file',
                    args=[obj.pk])
        )
    download_link.short_description = 'Download Log File'

    def get_urls(self):
        """Add url for download link LogFile."""
        urls = super().get_urls()
        custom_urls = [
            re_path(
                r'^download-log-file/(?P<pk>\d+)$',
                self.download_log_file,
                name='dashboard_download_log_file'
            ),
        ]
        return custom_urls + urls

    def download_log_file(self, request, pk):
        """Download log file action."""
        try:
            log_file = LogFile.objects.get(pk=pk)
            file_path = log_file.path
            file_handle = open(file_path, 'rb')

            # Use FileResponse for efficient streaming
            response = FileResponse(
                file_handle,
                content_type=mimetypes.guess_type(file_path)[0]
            )
            response['Content-Disposition'] = (
                f'attachment; filename="{log_file.filename()}"'
            )
            return response
        except LogFile.DoesNotExist:
            raise Http404("Log file not found")
        except Exception as e:
            return HttpResponse(f"Error: {e}", status=500)

    def refresh_log_files(self, request, queryset):
        """Refresh log file list."""
        LogFile.objects.all().delete()

        # Insert new log files
        new_log_files = list_log_files(settings.LOGS_DIRECTORY)
        log_entries = [
            LogFile(path=path, size=size, created_on=created_on)
            for path, size, created_on in new_log_files
        ]
        LogFile.objects.bulk_create(log_entries)

        # Send a success message
        self.message_user(
            request,
            "Log files have been refreshed.",
            level=messages.SUCCESS
        )

        # Redirect back to the log file list page
        return HttpResponseRedirect(request.get_full_path())

    refresh_log_files.short_description = "Refresh log files"


admin.site.register(MachineInfo, admin.ModelAdmin)
admin.site.register(LogFile, LogFileAdmin)
