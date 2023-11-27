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

from datetime import date

from django.contrib.gis.db import models

from core.models.general import (
    AbstractTerm, AbstractSource, AbstractEditData, AbstractVersionData
)
from geosight.data.models.code import CodeList
from geosight.data.models.indicator.indicator_type import (
    IndicatorType, IndicatorTypeChoices
)
from geosight.data.models.style.indicator_style import (
    IndicatorStyleBaseModel, IndicatorStyleType
)
from geosight.data.serializer.style import StyleRuleSerializer
from geosight.permission.models.manager import PermissionManager


class IndicatorValueRejectedError(Exception):
    """Exceptions for value rejected."""

    pass


class IndicatorGroup(AbstractTerm):
    """The group of indicator."""

    class Meta:  # noqa: D106
        ordering = ('name',)


class Indicator(
    IndicatorStyleBaseModel, AbstractTerm, AbstractSource, AbstractEditData,
    AbstractVersionData
):
    """The indicator model."""

    shortcode_helptext = (
        'A computer-to-computer shortcode for this indicator. '
        'For example, an abbreviated '
        'name that you might use to refer to it in a spreadsheet column.'
    )

    shortcode = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=shortcode_helptext
    )
    group = models.ForeignKey(
        IndicatorGroup, on_delete=models.SET_NULL,
        blank=True, null=True
    )
    unit = models.CharField(
        max_length=64,
        null=True, blank=True,
        help_text=(
            "A unit e.g. 'cases', 'people', 'children', "
            "that will be shown alongside the number in reports."
        )
    )

    # Aggregation
    aggregation_multiple_values = models.CharField(
        default='COUNT(value)',
        max_length=64,
        help_text='Default aggregation for multiple values',
        null=True, blank=True
    )
    aggregation_upper_level_allowed = models.BooleanField(
        default=False
    )
    aggregation_upper_level = models.CharField(
        default='COUNT(value)',
        max_length=64,
        help_text='Default aggregation for upper level',
        null=True, blank=True
    )

    # Value control
    type = models.CharField(
        max_length=256,
        default=IndicatorType.FLOAT,
        choices=IndicatorTypeChoices
    )
    min_value = models.FloatField(
        null=True, blank=True
    )
    max_value = models.FloatField(
        null=True, blank=True
    )
    codelist = models.ForeignKey(
        CodeList, null=True, blank=True,
        on_delete=models.SET_NULL
    )

    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        ordering = ('group__name', 'name')

    def __str__(self):
        if self.shortcode:
            return f'{self.group}/{self.name} ({self.shortcode})'
        return f'{self.group}/{self.name}'

    def save(self, *args, **kwargs):
        """On save method."""
        from geosight.georepo.tasks import create_data_access_indicator
        created = self.pk is None
        super(Indicator, self).save(*args, **kwargs)
        if created:
            create_data_access_indicator.delay(self.pk)

    @property
    def last_update(self):
        """Return reporting level."""
        first_value = self.query_values().first()
        if first_value:
            return first_value.date
        return None

    def rules_dict(self):
        """Return rules in list of dict."""
        from geosight.data.serializer.indicator import IndicatorRuleSerializer
        return [
            dict(rule) for rule in IndicatorRuleSerializer(
                self.indicatorrule_set.all(), many=True
            ).data
        ]

    @property
    def style_conf(self):
        """Return style."""
        if self.style_type == IndicatorStyleType.LIBRARY and self.style:
            return self.style
        return self

    def style_obj(self, user):
        """Return style."""
        from geosight.data.serializer.indicator import IndicatorRuleSerializer
        if self.style_type == IndicatorStyleType.PREDEFINED:
            return IndicatorRuleSerializer(
                self.indicatorrule_set.all(), many=True
            ).data
        if self.style_type == IndicatorStyleType.LIBRARY and self.style:
            if self.style.permission.has_read_perm(user):
                return StyleRuleSerializer(
                    self.style.stylerule_set.all(), many=True
                ).data
            return []
        return None

    def validate(self, value):
        """Check value."""
        if self.type == IndicatorType.INTEGER:
            try:
                if isinstance(value, str):
                    value = int(value)
                elif not isinstance(value, int):
                    if value % 1:
                        raise ValueError
                    raise ValueError

                if self.min_value is not None:
                    if value < self.min_value:
                        raise IndicatorValueRejectedError(
                            f'Value is less than {self.min_value}'
                        )
                if self.max_value is not None:
                    if value > self.max_value:
                        raise IndicatorValueRejectedError(
                            f'Value is more than {self.max_value}'
                        )
            except ValueError:
                raise IndicatorValueRejectedError('Value is not integer')
        elif self.type == IndicatorType.FLOAT:
            try:
                value = float(value)
                if self.min_value is not None:
                    if value < self.min_value:
                        raise IndicatorValueRejectedError(
                            f'Value is less than {self.min_value}'
                        )
                if self.max_value is not None:
                    if value > self.max_value:
                        raise IndicatorValueRejectedError(
                            f'Value is more than {self.max_value}')
            except ValueError:
                raise IndicatorValueRejectedError('Value is not float')
            except TypeError:
                raise IndicatorValueRejectedError('Value is empty')
        elif self.type == IndicatorType.STRING:
            if isinstance(value, str):
                if self.codelist:
                    codes = self.codelist.codes
                    if codes and value not in codes:
                        raise IndicatorValueRejectedError(
                            f'Value is not in {codes}'
                        )
            else:
                raise IndicatorValueRejectedError('Value is not string')

    def save_value(
            self,
            date: date, geom_id: str, value: any,
            reference_layer=None, admin_level: int = None, extras: dict = None,
            geom_id_type: str = 'ucode',
            more_error_information=False
    ):
        """Save new value for the indicator."""
        from geosight.data.models.indicator import (
            IndicatorValue, IndicatorExtraValue
        )
        from geosight.georepo.models import ReferenceLayerView
        from geosight.georepo.models.entity import Entity

        # Validate data
        try:
            self.validate(value)
        except IndicatorValueRejectedError as e:
            if more_error_information:
                raise IndicatorValueRejectedError(f'Error on {geom_id}: {e}')
            raise IndicatorValueRejectedError(e)

        # Save data
        if reference_layer and isinstance(reference_layer, str):
            reference_layer, _ = ReferenceLayerView.objects.get_or_create(
                identifier=reference_layer
            )

        # Find the ucode
        try:
            entity = Entity.get_entity(
                reference_layer=reference_layer,
                original_id=geom_id,
                original_id_type=geom_id_type,
                admin_level=admin_level,
                date_time=date
            )
            ucode = entity.geom_id
        except Exception as e:
            raise IndicatorValueRejectedError(f'{e}')

        # Save with original id first
        indicator_value, created = IndicatorValue.objects.get_or_create(
            indicator=self,
            date=date,
            geom_id=ucode
        )
        if self.type == IndicatorType.STRING:
            indicator_value.value_str = value
        else:
            indicator_value.value = value

        # Save the original one
        indicator_value.save()

        if extras:
            for extra_key, extra_value in extras.items():
                indicator_extra_value, created = \
                    IndicatorExtraValue.objects.get_or_create(
                        indicator_value=indicator_value,
                        name=extra_key
                    )
                indicator_extra_value.value = extra_value
                indicator_extra_value.save()

        return indicator_value

    def query_values(
            self, date_data: date = None, min_date_data: date = None,
            reference_layer=None, admin_level: int = None,
            concept_uuid: str = None, concept_uuids: str = None,
    ):
        """Return query of indicator values."""
        from geosight.data.models.indicator.indicator_value import (
            IndicatorValueWithGeo
        )
        query = IndicatorValueWithGeo.objects.filter(
            indicator_id=self.id
        )
        if reference_layer:
            query = query.filter(reference_layer_id=reference_layer.id)
        if admin_level:
            query = query.filter(admin_level=admin_level)
        if date_data:
            query = query.filter(date__lte=date_data)
        if min_date_data:
            query = query.filter(date__gte=min_date_data)
        if concept_uuid:
            query = query.filter(concept_uuid=concept_uuid)
        if concept_uuids:
            query = query.filter(concept_uuid__in=concept_uuids)
        return query

    def rule_by_value(self, value, rule_set=None):
        """Return scenario level of the value."""
        if not rule_set:
            rule_set = self.indicatorrule_set.all()
        if value is not None:
            # check the rule
            for indicator_rule in rule_set:
                try:
                    if indicator_rule.rule and eval(
                            indicator_rule.rule.replace(
                                'x', f'{value}').lower()
                    ):
                        return indicator_rule
                except (NameError, SyntaxError):
                    pass
            # This is empty one, use the other data
            return rule_set.filter(
                active=True
            ).filter(
                rule__icontains='other data'
            ).first()
        return None

    def values(
            self, date_data: date = None, min_date_data: date = None,
            reference_layer=None, admin_level: int = None,
            concept_uuids: list = None, last_value=True
    ):
        """Return list data based on date.

        If it is upper than the reporting geometry level,
        it will be aggregate to upper level
        """
        query = self.query_values(
            date_data=date_data, min_date_data=min_date_data,
            reference_layer=reference_layer, admin_level=admin_level,
            concept_uuids=concept_uuids
        )
        query = query.order_by(
            'concept_uuid', 'geom_id', '-date'
        )
        if last_value:
            query = query.distinct('geom_id', 'concept_uuid')
        return query
