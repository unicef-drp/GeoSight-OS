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
__date__ = '05/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime
from typing import List

import pytz
from django.conf import settings

from geosight.data.models.indicator import Indicator
from geosight.georepo.models.entity import Entity
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.serializer.entity import EntitySerializer


def entity_values(
        entity: Entity,
        indicators: List[Indicator],
):
    """Return values of entity.

    Parameters
    ------------
        entity: Entity
            Entity that will be checked.
        indicators: list of Indicator
            Values that will be returned by indicators.
    """
    siblings = entity.siblings
    children = entity.children
    ids = [
              entity.id
          ] + [
              sibling.id for sibling in siblings
          ] + [
              children.id for children in children
          ]

    parent = entity.parent
    if parent:
        ids.append(parent.id)

    # INDICATORS DATA
    indicators_data = {}
    for indicator in indicators:
        values = indicator.values(
            date_data=None,
            min_date_data=None,
            entities_id=ids,
            last_value=False
        )
        for value in values:
            key = value.concept_uuid
            if key not in indicators_data:
                indicators_data[key] = {}
            shortcode = indicator.shortcode
            indicator_key = shortcode if shortcode else indicator.id
            if indicator_key not in indicators_data[key]:
                indicators_data[key][indicator_key] = []

            indicators_data[key][indicator_key].append({
                'value': value.value,
                'time': datetime.combine(
                    value.date, datetime.min.time(),
                    tzinfo=pytz.timezone(settings.TIME_ZONE)
                ).isoformat()
            })

    # Construct context
    admin_boundary = EntitySerializer(entity).data
    try:
        admin_boundary['indicators'] = indicators_data[
            admin_boundary['concept_uuid']
        ]
    except KeyError:
        admin_boundary['indicators'] = {}

    # For parent
    if parent:
        admin_boundary['parent'] = EntitySerializer(parent).data
        try:
            admin_boundary['parent']['indicators'] = indicators_data[
                parent.concept_uuid
            ]
        except KeyError:
            admin_boundary['parent']['indicators'] = {}

    # For children
    admin_boundary['children'] = EntitySerializer(children, many=True).data
    for child in admin_boundary['children']:
        try:
            child['indicators'] = indicators_data[child['concept_uuid']]
        except KeyError:
            child['indicators'] = {}

    # For siblings
    admin_boundary['siblings'] = EntitySerializer(siblings, many=True).data
    for sibling in admin_boundary['siblings']:
        try:
            sibling['indicators'] = indicators_data[
                sibling['concept_uuid']
            ]
        except KeyError:
            sibling['indicators'] = {}

    return admin_boundary


def reference_layer_indicator_values(
        reference_layer: ReferenceLayerView,
        admin_level: int,
        indicators: List[Indicator],
        concept_uuids: list = None
):
    """Return values of reference layer indicator.

    Parameters
    ------------
        reference_layer: ReferenceLayerView
            Reference layer view that will be checked.
        admin_level: int
            Admin level of data that will be checked.
        indicators: list of Indicator
            Values that will be returned by indicators.
        concept_uuids: list, Optional
            List of concept uuid that will be checked.
    """
    entities = reference_layer.entities_set.filter(end_date__isnull=True)
    if admin_level is not None:
        entities = entities.filter(admin_level=admin_level)
    if concept_uuids:
        entities = entities.filter(concept_uuid__in=concept_uuids)

    output = []
    for entity in entities:
        output.append(entity_values(entity, indicators))
    return output
