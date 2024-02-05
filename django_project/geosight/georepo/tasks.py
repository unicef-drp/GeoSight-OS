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

from celery.utils.log import get_task_logger

from core.celery import app
from geosight.data.models.indicator import Indicator
from geosight.georepo.models.reference_layer import (
    ReferenceLayerView, ReferenceLayerIndicator
)
from geosight.georepo.request.request import GeorepoRequest

logger = get_task_logger(__name__)


@app.task
def fetch_reference_codes_by_ids(ids):
    """Fetch reference codes."""
    for reference_layer_view in ReferenceLayerView.objects.filter(id__in=ids):
        reference_layer_view.sync_entities_code()
        reference_layer_view.increase_version()


def fetch_reference_codes(_id):
    """Fetch reference codes."""
    try:
        reference_layer_view = ReferenceLayerView.objects.get(id=_id)
        reference_layer_view.sync_entities_code()
        reference_layer_view.increase_version()
    except ReferenceLayerView.DoesNotExist:
        logger.error(f'View {_id} does not exist')


@app.task
def fetch_datasets(fetch_code=False):
    """Fetch reference codes."""
    datasets = GeorepoRequest().get_reference_layer_list()
    for dataset in datasets:
        reference_layer_list = GeorepoRequest().get_reference_layer_views(
            dataset['uuid']
        )
        for reference_layer in reference_layer_list:
            ref, created = ReferenceLayerView.objects.get_or_create(
                identifier=reference_layer['uuid'],
                defaults={
                    'name': reference_layer['name'],
                    'description': reference_layer['description']
                }
            )
            if created:
                create_data_access_reference_layer_view(ref.id)
            if fetch_code:
                fetch_reference_codes(ref.id)


@app.task
def create_data_access_indicator(_id):
    """Create data access of indicator for all reference layer view."""
    try:
        indicator = Indicator.objects.get(id=_id)
        for reference_layer in ReferenceLayerView.objects.all():
            ReferenceLayerIndicator.objects.get_or_create(
                reference_layer=reference_layer,
                indicator=indicator
            )
    except Indicator.DoesNotExist:
        pass


@app.task
def create_data_access_reference_layer_view(_id):
    """Create data access of indicator for all reference layer view."""
    try:
        reference_layer = ReferenceLayerView.objects.get(id=_id)
        for indicator in Indicator.objects.all():
            ReferenceLayerIndicator.objects.get_or_create(
                reference_layer=reference_layer,
                indicator=indicator
            )
    except ReferenceLayerView.DoesNotExist:
        pass


@app.task
def create_data_access():
    """Create data access."""
    for indicator in Indicator.objects.all():
        create_data_access_indicator(indicator.id)
