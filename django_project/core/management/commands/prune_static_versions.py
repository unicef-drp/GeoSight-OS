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

import os
import shutil
from django.conf import settings
from django.core.management.base import BaseCommand


def _version_key(name):
    try:
        return tuple(int(x) for x in name.split("."))
    except ValueError:
        return (0,)


def prune(static_root_base, keep=3):
    """Prune old static file versions.

    Keeping the most recent `keep` versions.
    :param static_root_base: Base directory where static versions are stored.
    :type static_root_base: str
    :param keep: Number of most recent versions to keep.
    :type keep: int
    """
    releases = sorted(os.listdir(static_root_base), key=_version_key)
    to_delete = releases[:-keep]
    for release in to_delete:
        print(f"Removing old static version: {release}")
        shutil.rmtree(os.path.join(static_root_base, release))


def disk_usage_percent(path):
    """Calculate disk usage percentage for the given path.

    :param path: Path to check disk usage for.
    :type path: str
    :return: Disk usage percentage.
    :rtype: float
    """
    stat = shutil.disk_usage(path)
    return stat.used / stat.total * 100


class Command(BaseCommand):
    """Django management command to prune old static file versions."""

    help = "Prune old static file versions if disk usage exceeds 60%."

    def handle(self, *args, **options):
        """Handle the command execution."""
        static_base_dir = settings.STATIC_BASE_DIR
        usage = disk_usage_percent(static_base_dir)
        print(f"Disk usage for {static_base_dir}: {usage:.1f}%")
        if usage > 60:
            print("Usage exceeds 60%, pruning old versions...")
            prune(static_base_dir)
            print("Pruning complete.")
        else:
            print("Disk usage is below 60%, no pruning needed.")
