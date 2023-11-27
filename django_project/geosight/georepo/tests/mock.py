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

from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView


def mock_get_entity(
        original_id_type: str, original_id: str,
        reference_layer: ReferenceLayerView, admin_level=None,
        date_time=None, auto_fetch=True
):
    """Mock for get entity request."""
    entity, _ = Entity.objects.get_or_create(
        reference_layer=reference_layer,
        geom_id=original_id,
        admin_level=admin_level
    )
    return entity


@property
def need_review(self):
    """Mock for need_review importer."""
    return False


def update_meta(self):
    """Mock for update_meta importer."""
    return False
