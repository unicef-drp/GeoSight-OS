# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '13/11/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os
import re
import logging
import shutil
from core.celery import app
from django.conf import settings

from geosight.log.models import CleanupDirectoryLog


logger = logging.getLogger(__name__)


def delete_numbered_log_files(parent_dir, max_depth=2, dry_run=True):
    """
    Delete all numbered log files (e.g., worker.log.1, app.log.2, etc.).

    :param parent_dir: Parent directory to search for numbered log files
    :type parent_dir: str
    :param max_depth: Maximum depth to traverse subdirectories, defaults to 2
    :type max_depth: int, optional
    :param dry_run: If True, only report what would be deleted
        without actually deleting, defaults to True
    :type dry_run: bool, optional
    :return: Tuple containing (deleted_count, total_size_freed,
        deleted_files_list)
    :rtype: tuple[int, int, list[str]]

    :Example:

    >>> # Dry run first (safe - doesn't delete anything)
    >>> count, size, files = delete_numbered_log_files('/logs', max_depth=2,
        dry_run=True)
    >>> print(f"Would delete {count} files, {size / (1024*1024):.2f} MB")
    >>>
    >>> # Actually delete the files
    >>> count, size, files = delete_numbered_log_files('/logs', max_depth=2,
        dry_run=False)
    >>> print(f"Deleted {count} files, freed {size / (1024*1024):.2f} MB")
    """
    deleted_files = []
    total_size = 0
    deleted_count = 0

    # Pattern to match numbered log files: .log.1, .log.2, .txt.1, etc.
    # Limit to 1-3 digits to avoid matching year-suffixed
    # files (e.g. .log.2024)
    numbered_pattern = re.compile(r'\.(log|txt|status)\.\d{1,3}$')

    try:
        for entry in os.scandir(parent_dir):
            if entry.is_file():
                # Check if filename matches numbered log pattern
                if numbered_pattern.search(entry.name):
                    try:
                        stat = entry.stat()
                        file_size = stat.st_size
                        if dry_run:
                            logger.info(
                                f"[DRY RUN] Would delete: {entry.path} "
                                f"({file_size} bytes)"
                            )
                        else:
                            os.remove(entry.path)
                            logger.info(
                                f"Deleted: {entry.path} ({file_size} bytes)"
                            )

                        deleted_files.append(entry.path)
                        total_size += file_size
                        deleted_count += 1
                    except (OSError, PermissionError) as e:
                        logger.error(
                            f"Error deleting {entry.path}: {e}",
                            exc_info=True
                        )
                        continue

            elif entry.is_dir() and max_depth > 0:
                # Recursively delete in subdirectories
                try:
                    sub_count, sub_size, sub_files = delete_numbered_log_files(
                        entry.path, max_depth - 1, dry_run
                    )
                    deleted_count += sub_count
                    total_size += sub_size
                    deleted_files.extend(sub_files)
                except (OSError, PermissionError):
                    continue
    except (OSError, PermissionError) as e:
        logger.error(
            f"Error accessing directory {parent_dir}: {e}", exc_info=True
        )

    return deleted_count, total_size, deleted_files


@app.task
def cleanup_tmp_directory(threshold_override=None):
    """Cleanup task for /tmp directory to remove old numbered log files.

    :param threshold_override: Override the critical threshold percentage.
        If None, uses STORAGE_CRITICAL_THRESHOLD from settings (default 90).
    :type threshold_override: int or float or None
    :return: Dict with total deleted file count and total size freed in bytes.
    :rtype: dict
    """
    critical_threshold = (
        threshold_override
        if threshold_override is not None
        else getattr(settings, 'STORAGE_CRITICAL_THRESHOLD', 90)
    )
    storage_paths = ['/tmp']
    total_deleted_count = 0
    total_freed_size = 0
    for path in storage_paths:
        if not path or not os.path.exists(path):
            continue

        disk_usage = shutil.disk_usage(path)
        usage_percent = round(
            (disk_usage.used / disk_usage.total) * 100, 2
        )

        if usage_percent > critical_threshold:
            logger.error(
                f"Storage '{path}' CRITICAL: {usage_percent:.2f}% "
                f"used at {path}"
            )
            # Perform cleanup of numbered log files
            deleted_count, freed_size, deleted_files = (
                delete_numbered_log_files(
                    path, max_depth=2, dry_run=False
                )
            )
            total_deleted_count += deleted_count
            total_freed_size += freed_size
            logger.info(
                f"Deleted {deleted_count} numbered log files, "
                f"freed {freed_size / (1024*1024):.2f} MB in '{path}'"
            )
            CleanupDirectoryLog.objects.create(
                storage_path=path,
                usage_percentage=usage_percent,
                critical_threshold=critical_threshold,
                deleted_files_count=deleted_count,
                freed_space_bytes=freed_size,
                deleted_files=deleted_files
            )

    return {
        'deleted_count': total_deleted_count,
        'freed_size_bytes': total_freed_size,
    }
