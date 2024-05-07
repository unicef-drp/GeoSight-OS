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

from django.core.management.base import BaseCommand

from geosight.data.models.dashboard import Dashboard
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.request.request import GeorepoRequest


class Command(BaseCommand):
    """Update all fixtures."""

    def handle(self, *args, **options):
        """Command handler."""
        for dashboard in Dashboard.objects.all():
            view = None
            if dashboard.dataset_identifier and not dashboard.reference_layer:
                detail = GeorepoRequest().get_reference_layer_views(
                    dashboard.dataset_identifier
                )
                for view_data in detail['results']:
                    if not view and 'latest' in view_data['tags']:
                        view, _ = ReferenceLayerView.objects.get_or_create(
                            identifier=view_data['uuid']
                        )
                        dashboard.reference_layer = view
                        dashboard.save()
