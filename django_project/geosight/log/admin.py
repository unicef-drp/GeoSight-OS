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

import mimetypes
import os
from datetime import datetime
from django.conf import settings
from django.contrib import admin, messages
from django.http import (
    HttpResponseRedirect,
    HttpResponse,
    Http404,
    FileResponse
)
from django.urls import re_path, reverse
from django.utils.html import format_html

from geosight.log.models import LogFile


def list_log_files(parent_dir):
    """Get list of log files from parent_dir.

    :param parent_dir: Parent directory to search for log files
    :type parent_dir: str

    :return: List of tuples containing (file_path, file_size, created_on)
    :rtype: list
    """
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


@admin.action(description='Delete selected logs file')
def delete_selected_logs_file(modeladmin, request, queryset):
    """Delete selected log files from filesystem.

    :param modeladmin: The ModelAdmin instance
    :type modeladmin: ModelAdmin
    :param request: The HttpRequest object
    :type request: HttpRequest
    :param queryset: QuerySet of selected LogFile instances
    :type queryset: QuerySet
    """
    for instance in queryset:
        if instance.path and os.path.exists(instance.path):
            try:
                os.remove(instance.path)
            except OSError:
                pass


@admin.register(LogFile)
class LogFileAdmin(admin.ModelAdmin):
    """Class that represents LogFile Admin."""

    list_display = (
        'filename', 'human_readable_size', 'created_on', 'download_link'
    )
    actions = ['refresh_log_files', delete_selected_logs_file]

    def human_readable_size(self, obj):
        """Display file size in human-readable format.

        :param obj: LogFile instance
        :type obj: LogFile

        :return: Human-readable file size (e.g., '4.80 MB', '1.23 GB')
        :rtype: str
        """
        if obj.size is None:
            return '-'

        size = obj.size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} PB"

    human_readable_size.short_description = 'Size'
    human_readable_size.admin_order_field = 'size'

    def download_link(self, obj):
        """Get download link for LogFile.

        :param obj: LogFile instance
        :type obj: LogFile

        :return: HTML formatted download link
        :rtype: str
        """
        return format_html(
            '<a href="{}">Download</a>',
            reverse(
                'admin:dashboard_download_log_file',
                args=[obj.pk]
            )
        )

    download_link.short_description = 'Download Log File'

    def get_urls(self):
        """Add custom URL patterns for LogFile admin.

        :return: List of URL patterns including custom download endpoint
        :rtype: list
        """
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
        """Download log file action.

        :param request: The HttpRequest object
        :type request: HttpRequest
        :param pk: Primary key of the LogFile instance
        :type pk: int

        :return: File response with log file content
        :rtype: FileResponse or HttpResponse

        :raises Http404: If log file is not found in database
        """
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
        """Refresh log file list from filesystem.

        :param request: The HttpRequest object
        :type request: HttpRequest
        :param queryset: QuerySet of selected LogFile instances (unused)
        :type queryset: QuerySet

        :return: Redirect to the log file list page
        :rtype: HttpResponseRedirect
        """
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
