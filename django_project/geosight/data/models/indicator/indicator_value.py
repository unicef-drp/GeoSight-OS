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
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from geosight.data.models.indicator.indicator import Indicator, IndicatorType


class IndicatorValue(models.Model):
    """The data of indicator that saved per date and geometry."""

    # This is geom id for the value
    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE
    )
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

    class Meta:  # noqa: D106
        unique_together = ('indicator', 'date', 'geom_id')
        ordering = ('-date',)
        indexes = [
            models.Index(fields=['geom_id'], name='indicator_value_geom_id'),
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
        """Return key of extra value in pythonic."""
        return self.name.replace(' ', '_').replace(':', '').lower()


class IndicatorValueWithGeo(models.Model):
    """Indicator value x entity view."""

    # This is geom id for the value
    indicator_id = models.BigIntegerField()
    identifier = models.CharField(
        max_length=256, null=True, blank=True
    )
    identifier_with_level = models.CharField(
        max_length=256, null=True, blank=True
    )
    date = models.DateField(
        _('Date'),
        help_text=_('The date of the value harvested.')
    )
    day = models.IntegerField(
        null=True, blank=True
    )
    month = models.IntegerField(
        null=True, blank=True
    )
    year = models.IntegerField(
        null=True, blank=True
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


@receiver(post_save, sender=IndicatorValue)
@receiver(pre_delete, sender=IndicatorValue)
def increase_version(sender, instance, **kwargs):
    """Increase verison of indicator signal."""
    instance.indicator.increase_version()
