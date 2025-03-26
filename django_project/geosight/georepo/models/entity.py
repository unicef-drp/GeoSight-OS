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
from django.core.exceptions import ObjectDoesNotExist
from django.db import connection
from django.db.models import Q, Subquery, Max, Min
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from core.utils import pg_value
from geosight.georepo.models.reference_layer import ReferenceLayerView
from geosight.georepo.request import (
    GeorepoRequest, GeorepoEntityDoesNotExist, GeorepoRequestError
)
from geosight.georepo.term import admin_level_country


class CountryManager(models.Manager):
    """Country manager for Entity."""

    def get_queryset(self):
        """Return the queryset."""
        return super().get_queryset().filter(admin_level=admin_level_country)


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

    # Country
    country = models.ForeignKey(
        'self',
        help_text=_(
            'The country of the entity. '
            'If null, it is the country of the entity.'
        ),
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # Country manager
    objects = models.Manager()
    countries = CountryManager()

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

            # TODO:
            #  reference layer will be removed after georepo
            #  has API to check country
            reference_layer: ReferenceLayerView,
            country_id: int = None,
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
                        Q(entity__start_date__lte=date_time) &
                        Q(entity__end_date__gte=date_time)
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
                        Q(start_date__lte=date_time) &
                        Q(end_date__gte=date_time)
                    )
                ).filter(
                    geom_id=original_id
                ).order_by('start_date').first()
                if not entity:
                    raise Entity.DoesNotExist
            if (
                    entity.admin_level != admin_level_country and
                    not entity.parents
            ):
                raise EntityCode.DoesNotExist()
        except (Entity.DoesNotExist, EntityCode.DoesNotExist):
            if not auto_fetch:
                raise GeorepoEntityDoesNotExist()

            entity = GeorepoRequest().View.find_entity(
                reference_layer.identifier, original_id_type, original_id
            )
            obj, _ = Entity.get_or_create(
                reference_layer,
                geom_id=entity.ucode,
                name=entity.name,
                admin_level=entity.admin_level,
                concept_uuid=entity.concept_uuid,
                start_date=entity.start_date,
                end_date=entity.end_date,
                parents=entity.parents
            )
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
    def check_country(obj, admin_level, parents, reference_layer):
        """Check country."""
        if admin_level != admin_level_country and not obj.country:
            try:
                parent_ucode = parents[-1]
                country = Entity.get_entity(
                    reference_layer=reference_layer,
                    original_id=parent_ucode,
                    original_id_type='ucode',
                    admin_level=admin_level_country
                )
                obj.country = country
            except Exception:
                pass

    @staticmethod
    def get_or_create(
            reference_layer: ReferenceLayerView,
            geom_id,
            name,
            admin_level,
            concept_uuid=None,
            start_date=None,
            end_date=None,
            parents=None
    ):
        """Get or create of entity."""
        from geosight.georepo.models.reference_layer_entity import (
            ReferenceLayerViewEntity
        )
        obj, created = Entity.objects.get_or_create(
            geom_id=geom_id,
            defaults={
                'concept_uuid': concept_uuid,
                'admin_level': admin_level,
                'start_date': start_date,
                'end_date': end_date,
                'parents': parents
            }
        )
        ReferenceLayerViewEntity.objects.get_or_create(
            reference_layer=reference_layer,
            entity=obj,
        )
        obj.reference_layer = reference_layer
        obj.concept_uuid = concept_uuid
        obj.name = name
        obj.parents = parents

        Entity.check_country(obj, admin_level, parents, reference_layer)
        obj.save()
        reference_layer.assign_country(obj, check_entity=False)
        return obj, created

    @property
    def reference_layer_set(self):
        """Return reference_layer."""
        reference_layer_ids = self.referencelayerviewentity_set.values(
            "reference_layer_id"
        )
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
                admin_level=self.admin_level
            ).exclude(pk=self.pk)
        except (IndexError, TypeError):
            return Entity.objects.none()

    @property
    def parent(self):
        """Return parent."""
        try:
            parent = self.parents[0]
            return Entity.objects.filter(
                geom_id=parent
            ).first()
        except (IndexError, TypeError):
            return None

    @property
    def ancestor(self):
        """Return ancestor."""
        try:
            ancestor = self.parents[len(self.parents) - 1]
            return Entity.objects.filter(
                geom_id=ancestor
            ).first()
        except (IndexError, TypeError):
            return None

    @property
    def children(self):
        """Return children."""
        return Entity.objects.filter(
            parents__contains=self.geom_id,
            admin_level=self.admin_level + 1
        )

    @property
    def is_country(self):
        """Return if the entity is ancestor."""
        return self.admin_level == admin_level_country

    @staticmethod
    def assign_country(step=1000000):
        """Assign country to entity."""
        query = """
            UPDATE geosight_georepo_entity AS entity
            SET country_id = parent.id
            FROM geosight_georepo_entity AS parent
            WHERE
                entity.id BETWEEN %(start_id)s AND %(end_id)s
            AND
                entity.parents ->> (entity.admin_level - 1) = parent.geom_id;
        """
        id__max = Entity.objects.aggregate(
            Max('id')
        )['id__max']
        id__min = Entity.objects.aggregate(
            Min('id')
        )['id__min']
        with connection.cursor() as cursor:
            for i in range(id__min, id__max + 1, step):
                start_id = i
                end_id = i + step
                params = {'start_id': start_id, 'end_id': end_id}
                cursor.execute(query, params)
                connection.commit()

    def update_indicator_value_data(self):
        """Update entity data in indicator value."""
        start_date = pg_value(self.start_date)
        end_date = pg_value(self.end_date)
        concept_uuid = pg_value(self.concept_uuid)

        # For country
        entity_name = pg_value(self.name)
        if self.is_country:
            country_id = self.id
            country_name = pg_value(self.name)
            country_geom_id = pg_value(self.geom_id)
        else:
            country_id = pg_value(self.country, 'id')
            country_name = pg_value(self.country, 'name')
            country_geom_id = pg_value(self.country, 'geom_id')

        query = f"""
            UPDATE geosight_data_indicatorvalue
            SET
                entity_name = {entity_name},
                admin_level = {self.admin_level},
                concept_uuid = {concept_uuid},
                entity_start_date = {start_date},
                entity_end_date = {end_date},
                country_id = {country_id},
                country_name = {country_name},
                country_geom_id = {country_geom_id}
            WHERE
                entity_id = {self.id}
        """
        with connection.cursor() as cursor:
            cursor.execute(query)

    def update_parent_of_indicator_value_data(self):
        """Update entity data in indicator value."""
        # For country
        if self.is_country:
            country_name = pg_value(self.name)
            country_geom_id = pg_value(self.geom_id)
            query = f"""
                UPDATE geosight_data_indicatorvalue
                SET
                    country_name = {country_name},
                    country_geom_id = {country_geom_id}
                WHERE
                    country_id = {self.id}
            """
            with connection.cursor() as cursor:
                cursor.execute(query)

    def create_reference_layer_view_entity(self):
        """Create link between reference and entity."""
        from geosight.georepo.models.reference_layer_entity import (
            ReferenceLayerViewEntity
        )
        ReferenceLayerViewEntity.objects.get_or_create(
            reference_layer=self.reference_layer,
            entity=self,
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


@receiver(pre_save, sender=Entity)
def update_indicator_value_data(sender, instance, **kwargs):
    """Update indicator value data when entity changed."""
    if not instance._state.adding:
        try:
            old_instance = sender.objects.get(pk=instance.pk)

            # If just name, call the ancestor update
            if old_instance.name != instance.name:
                instance.update_parent_of_indicator_value_data()

            if (
                    old_instance.name != instance.name or
                    old_instance.admin_level != instance.admin_level or
                    old_instance.concept_uuid != instance.concept_uuid or
                    old_instance.start_date != instance.start_date or
                    old_instance.end_date != instance.end_date or
                    old_instance.country_id != instance.country_id
            ):
                instance.update_indicator_value_data()
        except ObjectDoesNotExist:
            pass


@receiver(post_save, sender=Entity)
def assign_entity_to_view(sender, instance: Entity, created, **kwargs):
    """Assign entity to view relationship."""
    # Get the country
    if instance.admin_level != admin_level_country and not instance.country:
        try:
            instance.country = Entity.objects.get(
                geom_id=instance.ancestor
            )
            instance.save()
        except Entity.DoesNotExist:
            pass

    if instance.reference_layer:
        instance.create_reference_layer_view_entity()
        instance.reference_layer.assign_country(instance)
