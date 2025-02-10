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
import traceback
from uuid import uuid4

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import GEOSGeometry, Polygon, MultiPolygon
from django.utils import timezone
from fiona.model import to_dict

from geosight.georepo.models.entity import Entity
from geosight.reference_dataset.models.reference_dataset_importer import (
    ReferenceDatasetImporter, ReferenceDatasetImporterLevel, LogStatus
)
from geosight.reference_dataset.utils.fiona import (
    open_collection_by_file, delete_tmp_shapefile,
    GEOJSON, SHAPEFILE, GEOPACKAGE
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


def check_layer_type(filename: str) -> str:
    """Check layer type of uploader."""
    if (filename.lower().endswith('.geojson') or
            filename.lower().endswith('.json')):
        return GEOJSON
    elif filename.lower().endswith('.zip'):
        return SHAPEFILE
    elif filename.lower().endswith('.gpkg'):
        return GEOPACKAGE
    return ''


class ReferenceDatasetImporterTask:
    """Abstract class for importer."""

    def __init__(self, importer: ReferenceDatasetImporter):
        """Init class."""
        self.importer = importer

    def read_file(
            self, importer_level: ReferenceDatasetImporterLevel,
            progress_changed
    ):
        """Read file."""
        reference_layer = importer_level.importer.reference_layer
        level = int(importer_level.level)
        name_field = importer_level.name_field
        ucode_field = importer_level.ucode_field
        parent_ucode_field = importer_level.parent_ucode_field

        with open_collection_by_file(
                importer_level.file,
                check_layer_type(importer_level.file.path)
        ) as features:
            data = []
            count = len(features)
            for idx, feature in enumerate(features):
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
                            parent = reference_layer.entities_set.filter(
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
                centroid = geom.point_on_surface

                data.append(
                    Entity(
                        parents=parents,
                        reference_layer=reference_layer,
                        admin_level=level,
                        geom_id=entity_ucode,
                        concept_uuid=str(uuid4()),
                        geometry=geom,
                        centroid=centroid,
                        name=entity_name
                    )
                )
                if len(data) == 5:
                    Entity.objects.bulk_create(data, batch_size=5)
                    data.clear()

                progress_changed((idx + 1) / count)
            if len(data) > 0:
                Entity.objects.bulk_create(data)
            delete_tmp_shapefile(features.path)

    def _error(self, message: str):
        """Raise error and update log."""
        self.importer.end_time = timezone.now()
        self.importer.status = LogStatus.FAILED
        self.importer.note = message
        self.importer.save()

    def _done(self, message: str = ''):
        """Update log to done."""
        self.importer.end_time = timezone.now()
        self.importer.status = LogStatus.SUCCESS
        self.importer.note = message
        self.importer.progress = 100
        self.importer.save()

    def run(self):
        """To run the process."""
        try:
            self.importer.status = LogStatus.RUNNING
            self.importer.save()
            reference_layer = self.importer.reference_layer
            reference_layer.entities_set.all().delete()

            total = self.importer.referencedatasetimporterlevel_set.count()
            min_progress = 0
            max_progress = 80
            progress_section = max_progress / total
            for idx, level in enumerate(
                    self.importer.referencedatasetimporterlevel_set.all()
            ):
                self.importer.note = f'Importing level {idx}'
                self.importer.progress = (progress_section * idx)
                self.importer.save()

                def progress_update(progress):
                    """Update progress based on feature saved."""
                    progress = progress_section * progress
                    self.importer.progress = progress + min_progress
                    self.importer.save()

                self.read_file(level, progress_update)
                min_progress = self.importer.progress

            self._done('All data has been imported')
        except Exception:
            self._error(
                f'{traceback.format_exc().replace(" File", "<br>File")}'
            )
