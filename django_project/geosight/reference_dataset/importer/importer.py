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
from geosight.georepo.term import admin_level_country
from geosight.reference_dataset.models.reference_dataset_importer import (
    ReferenceDatasetImporter, ReferenceDatasetImporterLevel, LogStatus
)
from geosight.reference_dataset.utils.fiona import (
    open_collection_by_file, delete_tmp_shapefile,
    GEOJSON, SHAPEFILE, GEOPACKAGE
)

User = get_user_model()


def get_feature_value(feature, field_name, default='') -> str:
    """
    Retrieve the value of a given field from a GeoJSON feature's properties.

    This function attempts to extract the value associated with `field_name`
    from the `properties` dictionary of a GeoJSON `feature`. If the field is
    missing or the value is `None`, it returns the provided default value.
    Otherwise, it converts the value to a stripped string.

    :param feature: A GeoJSON feature dictionary containing a `properties` key.
    :type feature: dict
    :param field_name: The name of the property field to retrieve.
    :type field_name: str
    :param default:
        The default value to return if the field is missing or `None`.
    :type default: str, optional
    :return: The string value of the requested property, or the default.
    :rtype: str
    """
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
    """
    Build a GEOSGeometry object from a geometry string.

    Attempts to parse a geometry string (WKT, WKB, or GeoJSON) into a Django
    `GEOSGeometry` object. If parsing fails, returns `None` and logs an error.

    :param geom_str: A geometry string in WKT, WKB, or GeoJSON format.
    :type geom_str: str

    :return: A GEOSGeometry object if parsing is successful; otherwise, None.
    :rtype: GEOSGeometry | None
    """
    geom = None
    try:
        geom = GEOSGeometry(geom_str)
    except Exception:
        print('Error building geom object ', geom)
    return geom


def check_layer_type(filename: str) -> str:
    """
    Determine the layer type based on the file extension.

    Supported file types:
    - `.geojson` or `.json` → GEOJSON
    - `.zip` → SHAPEFILE
    - `.gpkg` → GEOPACKAGE

    :param filename: The name of the uploaded file.
    :type filename: str

    :return:
        The corresponding layer type constant,
        or an empty string if unsupported.
    :rtype: str
    """
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

    def __init__(  # noqa DOC101
            self, importer: ReferenceDatasetImporter
    ) -> None:
        """
        Initialize the importer handler with a given importer instance.

        :param importer: The reference dataset importer instance to operate on.
        """
        self.importer = importer

    def read_file(
            self, importer_level: ReferenceDatasetImporterLevel,
            progress_changed
    ) -> None:
        """
        Read and process the file for a specific importer level.

        This method reads the file associated with the given `importer_level`
        and optionally reports progress through
        the `progress_changed` callback.

        :param importer_level:
            The importer level instance that contains the file to read.
        :type importer_level: ReferenceDatasetImporterLevel
        :param progress_changed:
            Callback function to report progress updates.
            Expected to accept a single integer argument (percentage).
        :type progress_changed: Callable[[int], None]
        :return: None
        :rtype: None
        """
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

            # Create reference view link
            for entity in Entity.objects.filter(
                    reference_layer=reference_layer,
                    admin_level=level
            ):
                entity.create_reference_layer_view_entity()

            # Assign reference layer countries
            if level == admin_level_country:
                reference_layer.assign_countries()
            else:
                Entity.assign_country()

    def _error(self, message: str) -> None:
        """
        Mark the import process as failed and save the error message.

        This method updates the associated importer's status to `FAILED`,
        sets the current time as the end time,
        stores the provided error message, and saves the changes.

        :param message: Error message or note to store with the import log.
        :type message: str
        :return: None
        :rtype: None
        """
        self.importer.end_time = timezone.now()
        self.importer.status = LogStatus.FAILED
        self.importer.note = message
        self.importer.save()

    def _done(self, message: str = '') -> None:
        """
        Mark the import process as completed successfully.

        This method updates the associated importer's status to `SUCCESS`,
        sets the current time as the end time,
        sets the progress to 100%, and saves an optional note.

        :param message: Optional message or note to store with the import log.
        :type message: str
        :return: None
        :rtype: None
        """
        self.importer.end_time = timezone.now()
        self.importer.status = LogStatus.SUCCESS
        self.importer.note = message
        self.importer.progress = 100
        self.importer.save()

    def run(self) -> None:
        """To run the process.

        Running the process of the importer.

        :return: None
        :rtype: None
        """
        try:
            self.importer.status = LogStatus.RUNNING
            self.importer.save()
            reference_layer = self.importer.reference_layer

            # Remove old entities
            Entity.objects.filter(reference_layer=reference_layer).delete()
            query = self.importer.referencedatasetimporterlevel_set.filter(
                level__isnull=False
            )
            total = query.count()
            min_progress = 0
            max_progress = 80
            progress_section = max_progress / total
            for idx, level in enumerate(query):
                self.importer.note = f'Importing level {idx}'
                self.importer.progress = (progress_section * idx)
                self.importer.save()

                def progress_update(progress: int) -> None:
                    """Update progress based on feature saved.

                    :param progress: progress value.
                    :type progress: int

                    :return: None
                    :rtype: None
                    """
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
