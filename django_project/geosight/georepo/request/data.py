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

from dateutil import parser


class GeorepoEntity(object):
    """Georepo Entity Model."""

    ucode = None
    uuid = None
    concept_uuid = None
    is_latest = None
    start_date = None
    end_date = None
    name = None
    admin_level = None
    type = None
    ext_codes = {}
    names = {}
    parents = []

    def __init__(self, data):
        """Init data."""
        for key, value in data.items():
            if key == 'start_date' or key == 'end_date':
                value = parser.parse(value)
            setattr(self, key, value)

        if self.parents:
            parents = sorted(self.parents, key=lambda d: d['admin_level'])
            parents.reverse()
            parent_in_list = []
            for parent in parents:
                parent_in_list.append(parent['ucode'])
            self.parents = parent_in_list

    def get_or_create(self, reference_layer):
        """Save the data."""
        from geosight.georepo.models.entity import Entity
        return Entity.get_or_create(
            reference_layer,
            geom_id=self.ucode,
            name=self.name,
            admin_level=self.admin_level,
            concept_uuid=self.concept_uuid,
            start_date=self.start_date,
            end_date=self.end_date,
            parents=self.parents
        )
