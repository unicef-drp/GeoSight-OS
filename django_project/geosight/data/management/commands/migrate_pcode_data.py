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

from geosight.data.models.indicator import IndicatorValueWithGeo
from geosight.georepo.models.entity import Entity, EntityCode
from geosight.georepo.models.reference_layer import ReferenceLayerView


class Command(BaseCommand):
    """Update all _fixtures."""

    def handle(self, *args, **options):
        """Command handler."""
        not_founds = []
        for value in IndicatorValueWithGeo.objects.filter(
                reference_layer_id__isnull=True
        ).order_by('geom_id'):
            print('---------------')
            print(f'check -> {value.geom_id}')
            if value.geom_id in not_founds:
                continue
            found = False
            code = EntityCode.objects.filter(
                code_type='PCode', code=value.geom_id
            ).first()
            if code:
                indicator_value = value.indicator_value
                indicator_value.geom_id = code.entity.geom_id
                indicator_value.save()
                print(
                    f'indicator value {value.pk} -> '
                    f'{code.entity.geom_id}'
                )
                found = True
            for reference_layer in ReferenceLayerView.objects.all():
                if found:
                    continue
                try:
                    entity = Entity.get_entity(
                        reference_layer=reference_layer,
                        original_id_type='PCode',
                        original_id=value.geom_id
                    )
                    if entity and entity.geom_id:
                        print(
                            f'indicator value {value.pk} -> '
                            f'{entity.geom_id}'
                        )
                        indicator_value = value.indicator_value
                        indicator_value.geom_id = entity.geom_id
                        indicator_value.save()
                        found = True
                        continue
                except Exception:
                    pass
            if not found:
                not_founds.append(value.geom_id)
