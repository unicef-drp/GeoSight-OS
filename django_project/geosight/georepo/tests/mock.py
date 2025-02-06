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

from geosight.georepo.request.data import GeorepoEntity


def mock_get_entity(
        original_id_type: str, original_id: str,
        reference_layer, admin_level=None,
        date_time=None, auto_fetch=True
):
    """Mock for get entity request."""
    from geosight.georepo.models.entity import Entity
    try:
        entity = Entity.objects.get(geom_id=original_id)
    except Entity.DoesNotExist:
        entity = GeorepoEntity(
            {
                'name': '',
                'ucode': original_id,
                'admin_level': admin_level
            }
        )
        entity, _ = Entity.get_or_create(reference_layer, entity=entity)
    return entity


@property
def need_review(self):
    """Mock for need_review importer."""
    return False


def update_meta(self):
    """Mock for update_meta importer."""
    return False
