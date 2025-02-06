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

from datetime import datetime

from django.contrib.gis.db import models
from django.db.models import Q, Subquery
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.request import (
    GeorepoRequest, GeorepoEntityDoesNotExist, GeorepoRequestError
)


class Entity(models.Model):
    """Entity data."""

    parents = models.JSONField(
        help_text='List of parents, ordered by most bottom to top.',
        null=True, blank=True
    )

    # -------------------------------------------------------
    # Grouping by geometries
    # By Reference Layer
    # By Level
    reference_layer = models.ForeignKey(
        ReferenceLayerView,
        help_text=_('Reference layer.'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    admin_level = models.IntegerField(
        null=True, blank=True
    )
    # This is geom id for the value
    geom_id = models.CharField(
        max_length=256,
        help_text='This is ucode from georepo.',
        unique=True
    )
    # This is concept uuid for the value
    concept_uuid = models.CharField(
        max_length=256,
        help_text='This is concept uuid from georepo.',
        null=True, blank=True
    )
    start_date = models.DateTimeField(
        null=True, blank=True
    )
    end_date = models.DateTimeField(
        null=True, blank=True
    )

    # Name of entity
    name = models.CharField(
        max_length=512,
        help_text='label of entity.',
        default=''
    )

    # Geometry field
    geometry = models.GeometryField(
        null=True, blank=True
    )
    centroid = models.PointField(
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        verbose_name_plural = "entities"
        indexes = [
            models.Index(fields=['geom_id'], name='entity_geom_id'),
            models.Index(fields=['concept_uuid'], name='entity_concept_uuid'),
            models.Index(fields=['id', 'reference_layer']),
            models.Index(
                fields=['concept_uuid', 'reference_layer', 'admin_level']
            ),
        ]

    def __str__(self):
        """Return entity name."""
        return self.geom_id

    @staticmethod
    def get_entity(
            original_id_type: str, original_id: str,
            reference_layer: ReferenceLayerView,
            admin_level: int = None,
            date_time=timezone.now(),
            auto_fetch: bool = True
    ):
        """Return ucode for the code."""
        if not date_time:
            raise GeorepoRequestError('Date time is empty.')
        try:
            try:
                date_time = datetime.fromtimestamp(date_time)
            except (ValueError, TypeError):
                pass
            if original_id_type != 'ucode':
                entities = reference_layer.entities_set.values_list(
                    'entity_id', flat=True
                )
                entity_code = EntityCode.objects.filter(
                    Q(entity__end_date__isnull=True) | Q(
                        Q(entity__start_date__gte=date_time) &
                        Q(entity__end_date__lte=date_time)
                    )
                ).filter(
                    code_type=original_id_type,
                    code=original_id,
                    entity_id__in=entities
                ).order_by('entity__start_date').first()
                if not entity_code:
                    raise EntityCode.DoesNotExist
                entity = entity_code.entity
            else:
                entity = reference_layer.entities_set.filter(
                    Q(end_date__isnull=True) | Q(
                        Q(start_date__gte=date_time) &
                        Q(end_date__lte=date_time)
                    )
                ).filter(
                    geom_id=original_id,
                    reference_layer_id=reference_layer.id
                ).order_by('start_date').first()
                if not entity:
                    raise Entity.DoesNotExist
            if entity.admin_level != 0 and not entity.parents:
                raise EntityCode.DoesNotExist()
        except (Entity.DoesNotExist, EntityCode.DoesNotExist):
            if not auto_fetch:
                raise GeorepoEntityDoesNotExist()

            entity = GeorepoRequest().View.find_entity(
                reference_layer.identifier, original_id_type, original_id
            )
            obj, _ = Entity.get_or_create(reference_layer, entity=entity)
            entity_code, _ = EntityCode.objects.get_or_create(
                entity=obj,
                code_type=original_id_type,
                code=original_id
            )
            entity = entity_code.entity

        # Check admin level
        if admin_level is not None:
            if entity.admin_level != int(admin_level):
                raise GeorepoEntityDoesNotExist()
        return entity

    @staticmethod
    def get_or_create(
            reference_layer: ReferenceLayerView, entity
    ):
        """Get or create of entity."""
        from geosight.georepo.models.reference_layer_entity import (
            ReferenceLayerViewEntity
        )
        obj, created = Entity.objects.get_or_create(
            geom_id=entity.ucode,
            defaults={
                'concept_uuid': entity.concept_uuid,
                'start_date': entity.start_date,
                'end_date': entity.end_date,
                'admin_level': entity.admin_level
            }
        )
        ReferenceLayerViewEntity.objects.get_or_create(
            reference_layer=reference_layer,
            entity=obj,
        )
        obj.name = entity.name
        obj.parents = entity.parents
        obj.save()
        return obj, created

    @property
    def reference_layer_set(self):
        """Return reference_layer."""
        reference_layer_ids = self.referencelayerviewentity_set.values(
            "reference_layer_id")
        return ReferenceLayerView.objects.filter(
            pk__in=Subquery(reference_layer_ids)
        )

    @property
    def siblings(self):
        """Return siblings."""
        try:
            parent = self.parents[0]
            return Entity.objects.filter(
                parents__contains=parent,
                admin_level=self.admin_level,
                end_date__isnull=True
            ).exclude(pk=self.pk)
        except (IndexError, TypeError):
            return Entity.objects.none()

    @property
    def parent(self):
        """Return parent."""
        try:
            parent = self.parents[0]
            return Entity.objects.filter(
                geom_id=parent,
                end_date__isnull=True
            ).first()
        except (IndexError, TypeError):
            return None

    @property
    def children(self):
        """Return children."""
        return Entity.objects.filter(
            parents__contains=self.geom_id,
            admin_level=self.admin_level + 1,
            end_date__isnull=True
        )


class EntityCode(models.Model):
    """Additional data for Indicator value data."""

    entity = models.ForeignKey(
        Entity, on_delete=models.CASCADE
    )
    code = models.CharField(
        max_length=256
    )
    code_type = models.CharField(
        max_length=256
    )

    class Meta:  # noqa: D106
        unique_together = ('entity', 'code', 'code_type')


@receiver(post_save, sender=Entity)
def assign_entity_to_view(sender, instance: Entity, created, **kwargs):
    """Assign entity to view relationship."""
    from geosight.georepo.models.reference_layer_entity import (
        ReferenceLayerViewEntity
    )
    if instance.reference_layer:
        ReferenceLayerViewEntity.objects.get_or_create(
            reference_layer=instance.reference_layer,
            entity=instance,
        )
