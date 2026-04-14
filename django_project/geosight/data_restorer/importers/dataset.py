# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-No-reply@unicef.org

.. Note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '14/04/2026'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.geos import GEOSGeometry
from django.db.models import Model
from django.db.utils import IntegrityError

from geosight.data_restorer.importers.base import BaseImporter
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.models.reference_layer_entity import (
    ReferenceLayerViewEntity
)
from geosight.reference_dataset.models.reference_dataset import (
    ReferenceDatasetLevel
)


class DatasetImporter(BaseImporter):
    """Import dataset from a JSON file as new records (no pk reuse)."""

    def run(self):
        """
        Import all records from the dataset fixture file as new objects.

        :return: The newly created ``ReferenceLayerView`` instance.
        :rtype: geosight.georepo.models.reference_layer.ReferenceLayerView
        :raises ValueError: If no ``geosight_georepo.referencelayerview``
            record is found in the fixture.
        :raises IntegrityError: If a ``ReferenceLayerView`` with the same
            identifier already exists.
        """
        by_model = self._load()

        # -----------------------------------------------------------------
        # 1. ReferenceLayerView (exactly one expected)
        # -----------------------------------------------------------------
        view_records = by_model.get('geosight_georepo.referencelayerview', [])
        if not view_records:
            raise ValueError(
                'No geosight_georepo.referencelayerview record found.'
            )

        view_fields = view_records[0]['fields']
        creator = self._get_user(view_fields['creator'])

        if ReferenceLayerView.objects.filter(
                identifier=view_fields['identifier']).exists():
            raise IntegrityError(
                f'Dataset with shortcode "{view_fields["identifier"]}" '
                f'already exists.'
            )

        reference_layer = ReferenceLayerView(
            identifier=view_fields['identifier'],
            name=view_fields['name'],
            description=view_fields['description'],
            in_georepo=False,
            creator=creator,
            modified_by=creator,
        )
        # Use save on the base model to skip the task-scheduling logic
        # in ReferenceLayerView.save() (which would try to fetch from GeoRepo).
        Model.save(reference_layer)

        # -----------------------------------------------------------------
        # 2. ReferenceDatasetLevel
        # -----------------------------------------------------------------
        for level_record in by_model.get(
                'geosight_reference_dataset.referencedatasetlevel', []
        ):
            level = level_record['fields']
            ReferenceDatasetLevel.objects.create(
                reference_layer=reference_layer,
                level=level['level'],
                name=level['name'],
            )

        # -----------------------------------------------------------------
        # 3. Entity records (keyed by geom_id as the natural unique key)
        # -----------------------------------------------------------------
        entities = []
        for entity_record in by_model.get('geosight_georepo.entity', []):
            geometry = GEOSGeometry(entity_record['fields']['geometry'])
            entity = Entity(
                reference_layer=reference_layer,
                admin_level=entity_record['fields']['admin_level'],
                geom_id=entity_record['fields']['geom_id'],
                concept_uuid=entity_record['fields']['concept_uuid'],
                name=entity_record['fields']['name'],
                geometry=geometry,
                centroid=geometry.centroid,
            )
            entity.save()
            entities.append(entity)

        # -----------------------------------------------------------------
        # 4. ReferenceLayerViewEntity (link entities to reference layer)
        # -----------------------------------------------------------------
        ReferenceLayerViewEntity.objects.bulk_create([
            ReferenceLayerViewEntity(
                entity=entity,
                reference_layer=reference_layer,
            )
            for entity in entities
        ])

        reference_layer.assign_countries()
        return reference_layer
