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
__date__ = '13/02/2024'
__copyright__ = ('Copyright 2023, Unicef')

import json
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import GEOSGeometry, Polygon, MultiPolygon
from fiona.model import to_dict

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.models.reference_layer_importer import (
    ReferenceLayerViewImporter, ReferenceLayerViewImporterLevel, LogStatus
)
from geosight.georepo.models.reference_layer_temporary import (
    ReferenceLayerViewTemp, EntityTemp, ReferenceLayerViewLevelTemp
)
from geosight.utils.fiona import (
    open_collection_by_file, delete_tmp_shapefile
)

User = get_user_model()


def get_feature_value(feature, field_name, default='') -> str:
    """Read properties value from field_name from single feature."""
    value = (
        feature['properties'][field_name] if
        field_name in feature['properties'] else None
    )
    if value is None:
        # None is possible if read from shape file
        value = default
    else:
        # convert the returned value as string
        value = str(value).strip()
    return value


def build_geom_object(geom_str: str):
    """Build geom object."""
    geom = None
    try:
        geom = GEOSGeometry(geom_str)
    except Exception:
        print('Error building geom object ', geom)
    return geom


class ReferenceLayerViewImporterTask:
    """Abstract class for importer."""

    def __init__(self, importer: ReferenceLayerViewImporter):
        """Init class."""
        self.importer = importer

    def get_uuid(self):
        """Return uuid of view."""
        uuid = str(uuid4())
        if ReferenceLayerView.objects.filter(identifier=uuid).exists():
            return self.get_uuid()
        if ReferenceLayerViewTemp.objects.filter(identifier=uuid).exists():
            return self.get_uuid()
        return uuid

    def read_file(self, importer_level: ReferenceLayerViewImporterLevel):
        """Read file."""
        level = int(importer_level.level)
        name_field = importer_level.name_field
        ucode_field = importer_level.ucode_field
        parent_ucode_field = importer_level.parent_ucode_field

        with open_collection_by_file(
                importer_level.file, 'SHAPEFILE'
        ) as features:
            data = []
            for feature_idx, feature in enumerate(features):
                # default name
                entity_name = get_feature_value(
                    feature, name_field
                )
                # default name
                entity_ucode = get_feature_value(
                    feature, ucode_field
                )

                # find ancestor
                parents = []
                if level > 0:
                    parent_code = get_feature_value(
                        feature, parent_ucode_field
                    )
                    if parent_code:
                        if level == 1:
                            parents = [parent_code]
                        else:
                            parent = EntityTemp.objects.filter(
                                reference_layer=self.temp_view,
                                admin_level=level - 1,
                                geom_id=parent_code
                            ).first()
                            if parent:
                                parents = [parent_code] + parent.parents

                # create geometry
                geom_str = json.dumps(to_dict(feature['geometry']))
                geom = build_geom_object(geom_str)
                if geom and isinstance(geom, Polygon):
                    geom = MultiPolygon([geom])
                data.append(
                    EntityTemp(
                        parents=parents,
                        reference_layer=self.temp_view,
                        admin_level=level,
                        geom_id=entity_ucode,
                        concept_uuid=str(uuid4()),
                        geometry=geom,
                        name=entity_name
                    )
                )
                if len(data) == 5:
                    EntityTemp.objects.bulk_create(data, batch_size=5)
                    data.clear()
            if len(data) > 0:
                EntityTemp.objects.bulk_create(data)
            delete_tmp_shapefile(features.path)

    def run(self):
        """To run the process."""
        # Delete old one
        self.importer.referencelayerviewtemp_set.all().delete()
        self.importer.status = LogStatus.RUNNING
        self.importer.save()

        # Create reference layer temporary
        self.temp_view = ReferenceLayerViewTemp.objects.create(
            importer=self.importer,
            identifier=self.get_uuid(),
            name=self.importer.name,
            description=self.importer.description
        )
        # Create reference layer level temporary
        for level in self.importer.referencelayerviewimporterlevel_set.all():
            ReferenceLayerViewLevelTemp.objects.create(
                reference_layer=self.temp_view,
                level=level.level,
                name=level.name
            )
        for level in self.importer.referencelayerviewimporterlevel_set.all():
            """Save the entity."""
            self.read_file(level)
