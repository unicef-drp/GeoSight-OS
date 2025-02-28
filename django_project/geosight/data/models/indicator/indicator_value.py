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

from django.contrib.gis.db import models
from django.db import connection
from django.db.models import Min, Max
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from geosight.data.models.indicator.indicator import Indicator
from geosight.data.models.indicator.indicator_type import IndicatorType
from geosight.georepo.models.entity import Entity


class IndicatorValue(models.Model):
    """The data of indicator that saved per date and geometry."""

    # --------------------------------------
    # The basic attributes that is required
    # --------------------------------------
    date = models.DateField(
        _('Date'),
        help_text=_('The date of the value harvested.')
    )
    value = models.FloatField(
        null=True, blank=True
    )
    value_str = models.CharField(
        max_length=256, null=True, blank=True
    )
    geom_id = models.CharField(
        max_length=256,
        help_text='This is ucode from georepo.'
    )
    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE
    )

    # --------------------------------------
    # Attributes that are able to be generated
    # --------------------------------------
    # Entity that linked to this value
    entity = models.ForeignKey(
        Entity, null=True, blank=True,
        on_delete=models.SET_NULL
    )
    # Country that linked to this value
    country = models.ForeignKey(
        Entity,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='indicator_value_country',
    )

    # ------------------------------
    # This is as a flat table
    # ------------------------------
    # Indicator
    # ------------------------------
    indicator_name = models.CharField(
        max_length=512,
        null=True, blank=True
    )
    # ------------------------------
    # Entity
    # ------------------------------
    entity_name = models.CharField(
        max_length=512,
        null=True, blank=True
    )
    entity_admin_level = models.IntegerField(
        null=True, blank=True
    )
    entity_concept_uuid = models.CharField(
        max_length=256,
        help_text='This is concept uuid from georepo.',
        null=True, blank=True
    )
    entity_start_date = models.DateTimeField(
        null=True, blank=True
    )
    entity_end_date = models.DateTimeField(
        null=True, blank=True
    )
    # ------------------------------
    # Country
    # ------------------------------
    country_name = models.CharField(
        max_length=512,
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        unique_together = ('indicator', 'date', 'geom_id')
        ordering = ('-date',)
        indexes = [
            models.Index(
                fields=['geom_id']
            ),
            models.Index(
                fields=['indicator', 'entity']
            ),
            models.Index(
                fields=['indicator', 'country_id']
            ),
            models.Index(
                fields=['indicator', 'country_id', 'entity_admin_level']
            ),
            models.Index(
                fields=['indicator', 'entity_admin_level']
            ),
        ]

    @property
    def val(self):
        """Return val of value based on int or string."""
        if self.indicator.type == IndicatorType.STRING:
            return self.value_str
        return self.value

    @staticmethod
    def value_permissions(user, indicator, reference_layer=None):
        """Return value permissions for an user."""
        if user.profile.is_admin:
            return {
                'list': True, 'read': True, 'edit': True, 'share': True,
                'delete': True
            }
        elif indicator and indicator.permission.has_delete_perm(user):
            return {
                'list': True, 'read': True, 'edit': True, 'share': True,
                'delete': True
            }
        elif indicator and indicator.permission.has_share_perm(user):
            return {
                'list': True, 'read': True, 'edit': True, 'share': True,
                'delete': False
            }
        elif indicator and indicator.permission.has_edit_perm(user):
            return {
                'list': True, 'read': True, 'edit': True, 'share': True,
                'delete': True
            }
        elif indicator and indicator.permission.has_read_perm(user):
            return {
                'list': True, 'read': True, 'edit': False, 'share': False,
                'delete': False
            }
        # TODO:
        #  We need to fix this
        return {
            'list': True, 'read': True, 'edit': False, 'share': False,
            'delete': False
        }
        # try:
        #     obj = ReferenceLayerIndicator.objects.get(
        #         reference_layer=self.reference_layer,
        #         indicator=self.indicator,
        #     )
        #     permission = ReferenceLayerIndicatorPermission.objects.get(
        #     obj=obj)
        #     return permission.all_permission(user)
        # except (
        #         ReferenceLayerIndicatorPermission.DoesNotExist,
        #         ReferenceLayerIndicator.DoesNotExist
        # ):
        #     pass

    def permissions(self, user):
        """Return permission of user."""
        return IndicatorValue.value_permissions(user, self.indicator)

    @property
    def attributes(self):
        """Return attributes of value."""
        extra_value = {}
        try:
            for extra in self.indicatorextravalue_set.all():
                extra_value[extra.name] = extra.value
        except AttributeError:
            pass
        return extra_value

    def assign_entity(self, autosave=True):
        """Assign entity to indicator value."""
        if not self.entity_id:
            entity = Entity.objects.filter(
                geom_id=self.geom_id
            ).first()
            if entity:
                self.entity = entity
                self.entity_name = entity.name
                self.entity_admin_level = entity.admin_level
                self.entity_concept_uuid = entity.concept_uuid
                self.entity_start_date = entity.start_date
                self.entity_end_date = entity.end_date
                self.assign_country(autosave=autosave)
                if autosave:
                    self.save()

    def assign_country(self, autosave=True):
        """Assign entity to indicator value."""
        if not self.country_id and self.entity_admin_level >= 1:
            if self.entity and self.entity.country:
                self.country = self.entity.country
                self.country_name = self.country.name
                if autosave:
                    self.save()

    def assign_indicator(self, autosave=True):
        """Assign indicator flat value."""
        if not self.indicator_name:
            self.indicator_name = self.indicator.name
            self.indicator_type = self.indicator.type
            self.indicator_shortcode = self.indicator.shortcode
            if autosave:
                self.save()

    @staticmethod
    def assign_flat_table():
        """Assign flat table."""
        entity_query = """
            UPDATE geosight_data_indicatorvalue AS value
            SET entity_id = entity.id,
                entity_name = entity.name,
                admin_level = entity.admin_level,
                concept_uuid = entity.concept_uuid,
                entity_start_date = entity.start_date,
                entity_end_date = entity.end_date,
                country_id = CASE
                        WHEN entity.parents IS NULL
                            OR jsonb_array_length(entity.parents) = 0
                        THEN entity.id
                        ELSE country.id
                END,
                country_name = CASE
                    WHEN entity.parents IS NULL
                        OR jsonb_array_length(entity.parents) = 0
                    THEN entity.name
                    ELSE country.name
                END
            FROM
                geosight_georepo_entity AS entity
            LEFT JOIN geosight_georepo_entity
                AS country ON entity.country_id=country.id
            WHERE
                value.geom_id = entity.geom_id
                AND
                value.id BETWEEN %(start_id)s AND %(end_id)s;
        """
        indicator_query = """
            UPDATE geosight_data_indicatorvalue AS value
            SET indicator_name = indicator.name,
                indicator_type = indicator.type,
                indicator_shortcode = indicator.shortcode
            FROM geosight_data_indicator AS indicator
            WHERE
                value.indicator_id = indicator.id
                AND value.id BETWEEN %(start_id)s AND %(end_id)s;
        """
        id__max = IndicatorValue.objects.aggregate(
            Max('id')
        )['id__max']
        id__min = IndicatorValue.objects.aggregate(
            Min('id')
        )['id__min']
        step = 10000000  # 1 million
        progress = 0
        progress += 1
        with connection.cursor() as cursor:
            for i in range(id__min, id__max + 1, step):
                start_id = i
                end_id = i + step - 1
                params = {'start_id': start_id, 'end_id': end_id}
                cursor.execute(entity_query, params)
                cursor.execute(indicator_query, params)


class IndicatorExtraValue(models.Model):
    """Additional data for Indicator value data."""

    indicator_value = models.ForeignKey(
        IndicatorValue, on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=100,
        help_text=_(
            "The name of attribute"
        )
    )
    value = models.TextField(
        null=True, default=True,
        help_text=_(
            "The value of attribute"
        )
    )

    class Meta:  # noqa: D106
        unique_together = ('indicator_value', 'name')

    def __str__(self):
        return f'{self.name}'

    @property
    def key(self):
        """Return key of attributes in pythonic."""
        return self.name.replace(' ', '_').replace(':', '').lower()


class IndicatorValueWithGeo(models.Model):
    """Indicator value x entity view."""

    # This is geom id for the value
    indicator_id = models.BigIntegerField()
    entity_id = models.BigIntegerField()
    date = models.DateField(
        _('Date'),
        help_text=_('The date of the value harvested.')
    )
    value = models.FloatField(
        null=True, blank=True
    )
    value_str = models.CharField(
        max_length=256, null=True, blank=True
    )
    geom_id = models.CharField(
        max_length=256,
        help_text='This is ucode from georepo.'
    )
    # By Level
    reference_layer_id = models.BigIntegerField()
    reference_layer_name = models.CharField(
        max_length=256, null=True, blank=True
    )
    reference_layer_uuid = models.UUIDField()
    admin_level = models.IntegerField(
        null=True, blank=True
    )
    # This is concept uuid for the value
    concept_uuid = models.CharField(
        max_length=256,
        help_text='This is concept uuid from georepo.',
        null=True, blank=True
    )

    # Value control
    indicator_type = models.CharField(max_length=256, null=True, blank=True)
    indicator_shortcode = models.CharField(
        max_length=256, null=True, blank=True
    )
    indicator_name = models.CharField(
        max_length=256, null=True, blank=True
    )

    @property
    def indicator_value(self):
        """Return indicator value object."""
        return IndicatorValue.objects.get(id=self.id)

    @property
    def indicator(self):
        """Return indicator object."""
        return IndicatorValue.objects.get(id=self.id).indicator

    @property
    def permissions(self):
        """Return permissions object."""
        return IndicatorValue.objects.get(id=self.id).permissions

    @property
    def reference_layer(self):
        """Return reference layer object."""
        from geosight.georepo.models.reference_layer import ReferenceLayerView
        try:
            return ReferenceLayerView.objects.get(id=self.reference_layer)
        except ReferenceLayerView.DoesNotExist:
            return None

    class Meta:  # noqa: D106
        managed = False
        ordering = ('-date',)
        db_table = 'v_indicator_value_geo'

    @property
    def val(self):
        """Return val of value based on int or string."""
        if self.indicator_type == IndicatorType.STRING:
            return self.value_str
        return self.value

    @property
    def attributes(self):
        """Return val of value based on int or string."""
        try:
            return IndicatorValue.objects.get(id=self.id).attributes
        except Indicator.DoesNotExist:
            return {}


@receiver(post_save, sender=IndicatorValue)
@receiver(pre_delete, sender=IndicatorValue)
def increase_version(sender, instance, **kwargs):
    """Increase verison of indicator signal."""
    instance.indicator.increase_version()


@receiver(post_save, sender=IndicatorValue)
def assign_entity_and_indicator_to_value(
        sender, instance: IndicatorValue, created, **kwargs
):
    """Assign entity to value."""
    instance.assign_entity()
    instance.assign_indicator()
