"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '25/04/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os


def delete_file_on_delete(sender, instance, **kwargs):
    """Deletes file from filesystem.

    when corresponding `MediaFile` object is deleted.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)


def delete_file_on_change(Sender, instance, **kwargs):
    """Deletes old file from filesystem.

    when corresponding `MediaFile` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = Sender.objects.get(pk=instance.pk).file
    except Sender.DoesNotExist:
        return False

    new_file = instance.file
    if old_file and not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)
