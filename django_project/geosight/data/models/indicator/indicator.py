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

from datetime import date, datetime

import pytz
from django.conf import settings
from django.contrib.gis.db import models
from django.db import connection
from django.db.models.signals import post_save
from django.dispatch import receiver

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

VALUE_IS_EMPTY_TEXT = 'Value is empty'


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
            return StyleRuleSerializer(
                self.style.stylerule_set.all(), many=True
            ).data
        return None

    def validate(self, value):
        """Check value and return the comment."""
        comment = ''
        if value in [None, '']:
            raise IndicatorValueRejectedError(VALUE_IS_EMPTY_TEXT)

        if self.type == IndicatorType.INTEGER:
            try:
                if isinstance(value, str):
                    try:
                        value = int(value)
                    except ValueError:
                        value = float(value)
                if isinstance(value, float):
                    if not value.is_integer():
                        comment = 'Result was rounded to int.'
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
                raise IndicatorValueRejectedError(VALUE_IS_EMPTY_TEXT)
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
        return value, comment

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
            value, comment = self.validate(value)
            if comment:
                if not extras:
                    extras = {}
                try:
                    extras['description'] += ' ' + comment
                except KeyError:
                    extras['description'] = comment
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

    def update_dashboard_version(self):
        """Update dashboard version."""
        from django.utils import timezone
        from geosight.data.models.dashboard import Dashboard
        Dashboard.objects.filter(
            id__in=self.dashboardindicator_set.values_list(
                'dashboard', flat=True
            )
        ).update(version_data=timezone.now())

    @staticmethod
    def search(name, description):
        """Update dashboard version."""
        if name:
            with connection.cursor() as cursor:
                cursor.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm;')
            query = (
                f"select strict_word_similarity(name, '{name}') as name_score,"
                f"strict_word_similarity(description, '{description}') "
                f"as description_score,"
                f"id, name, description from geosight_data_indicator"
            )
            return [
                {
                    'id': row.id,
                    'name': row.name,
                    'description': row.description,
                    'name_score': row.name_score,
                    'description_score': row.description_score,
                }
                for row in Indicator.objects.raw(
                    f'SELECT * from ({query}) as q '
                    f'WHERE name_score >= 0.5 OR description_score >= 0.3 '
                    f'ORDER BY name_score DESC, description_score DESC'
                )

            ]
        return []

    def metadata(self, reference_layer_uuid):
        """Metadata for indicator."""
        from geosight.georepo.models.reference_layer import ReferenceLayerView
        from geosight.data.models.indicator.indicator_value import (
            IndicatorValueWithGeo
        )
        try:
            query = self.query_values(
                reference_layer=ReferenceLayerView.objects.get(
                    identifier=reference_layer_uuid
                )
            )
        except ReferenceLayerView.DoesNotExist:
            ReferenceLayerView.objects.get_or_create(
                identifier=reference_layer_uuid
            )
            query = IndicatorValueWithGeo.objects.none()
        dates = [
            datetime.combine(
                date_str, datetime.min.time(),
                tzinfo=pytz.timezone(settings.TIME_ZONE)
            ).isoformat()
            for date_str in set(
                query.values_list('date', flat=True)
            )
        ]
        dates.sort()

        return {
            'dates': dates,
            'count': query.count()
        }

    def metadata_with_cache(self, reference_layer):
        """Metadata for indicator."""
        from core.cache import VersionCache
        version = self.version_with_reference_layer_uuid(
            reference_layer.version_with_uuid
        )
        cache = VersionCache(
            key=(
                f'METADATA : '
                f'Indicator {self.id} - {reference_layer.identifier}',
            ),
            version=version
        )
        cache_data = cache.get()
        if cache_data:
            return cache_data

        response = self.metadata(reference_layer.identifier)
        response['version'] = cache.version
        cache.set(response)
        return response


@receiver(post_save, sender=Indicator)
def increase_version(sender, instance, **kwargs):
    """Increase version of dashboard signal."""
    instance.update_dashboard_version()
