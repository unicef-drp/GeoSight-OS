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

from django.contrib.gis.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.db import connection
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from core.models.general import (
    AbstractTerm, AbstractSource, AbstractEditData, AbstractVersionData
)
from core.utils import pg_value
from geosight.data.models.code import CodeList
from geosight.data.models.indicator.indicator_type import (
    IndicatorType, IndicatorTypeChoices
)
from geosight.data.models.style.indicator_style import (
    IndicatorStyleBaseModel, IndicatorStyleType
)
from geosight.data.serializer.style import StyleRuleSerializer
from geosight.permission.access.mixin import edit_data_permission_resource
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

    def save(self, *args, **kwargs):  # noqa : DOC109, DOC110, DOC103
        """
        Override the save method to trigger asynchronous data access creation.

        :param args: Positional arguments.
        :param kwargs: Keyword arguments.
        """
        from geosight.georepo.tasks import create_data_access_indicator
        created = self.pk is None
        super(Indicator, self).save(*args, **kwargs)
        if created:
            create_data_access_indicator.delay(self.pk)

    @property
    def last_update(self):
        """
        Return the most recent update date of the indicator.

        :return: Date of the most recent value or ``None``.
        :rtype: date | None
        """
        first_value = self.query_values().first()
        if first_value:
            return first_value.date
        return None

    def rules_dict(self):
        """
        Return indicator rules as a list of dictionaries.

        :return: Serialized rule definitions.
        :rtype: list[dict]
        """
        from geosight.data.serializer.indicator import IndicatorRuleSerializer
        return [
            dict(rule) for rule in IndicatorRuleSerializer(
                self.indicatorrule_set.all(), many=True
            ).data
        ]

    @property
    def style_conf(self):
        """
        Return the indicator style configuration.

        :return: Style configuration instance.
        :rtype: IndicatorStyleBaseModel
        """
        if self.style_type == IndicatorStyleType.LIBRARY and self.style:
            return self.style
        return self

    def style_obj(self, user):
        """
        Return serialized style rules for the indicator.

        :param user: The requesting user.
        :type user: django.contrib.auth.models.User
        :return: Serialized style data or ``None``.
        :rtype: list[dict] | None
        """
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

    def able_to_write_data(self, user):
        """
        Check if the user has permission to edit data for this indicator.

        :param user: The user to check permission for.
        :type user: django.contrib.auth.models.User
        """
        edit_data_permission_resource(self, user)

    def validate(self, value):
        """
        Validate a value according to the indicator's type and constraints.

        :param value: The value to validate.
        :type value: any
        :raises IndicatorValueRejectedError: Raised if the value is empty,
            not an integer/float/string as required,
            out of min/max bounds, or not in the codelist.
        :raises ValueError: Internally caught; not propagated
        :return:
            A tuple containing the validated value and an optional comment.
        :rtype: tuple[any, str]
        """
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
                    codes = self.codelist.codes(value_only=True)
                    if codes and value not in codes:
                        raise IndicatorValueRejectedError(
                            f'Value is not in {codes}'
                        )
            else:
                raise IndicatorValueRejectedError('Value is not string')
        return value, comment

    def save_value(  # noqa: DOC501,DOC503
            self,
            date: date, geom_id: str, value: any,

            # TODO:
            #  reference layer will be removed after georepo
            #  has API to check country
            reference_layer=None,
            admin_level: int = None,
            extras: dict = None,
            geom_id_type: str = 'ucode',
            more_error_information=False
    ):
        """
        Save a new indicator value.

        :param date: The date of the value.
        :type date: date
        :param geom_id: The geometry identifier (ucode or original ID).
        :type geom_id: str
        :param value: The value to be stored.
        :type value: any
        :param reference_layer: The reference layer context.
        :type reference_layer: ReferenceLayerView | str | None
        :param admin_level: Optional administrative level.
        :type admin_level: int | None
        :param extras: Optional extra metadata to attach to the value.
        :type extras: dict | None
        :param geom_id_type: The type of geometry ID (default: ``'ucode'``).
        :type geom_id_type: str
        :param more_error_information: Include additional error context.
        :type more_error_information: bool
        :return: The created or updated IndicatorValue instance.
        :rtype: IndicatorValue
        """
        from geosight.data.models.indicator import (
            IndicatorValue
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
        indicator_value.assign_entity(entity)
        indicator_value.save()

        if extras:
            for extra_key, extra_value in extras.items():
                indicator_value.add_extra_value(extra_key, extra_value)
        return indicator_value

    def query_values(
            self, date_data: date = None, min_date_data: date = None,

            # TODO:
            #  reference layer will be removed after georepo
            #  has API to check country
            reference_layer=None,

            countries_id: list = None,
            admin_level: int = None,
            concept_uuid: str = None,
            concept_uuids: list = None,
            entities_id: list = None
    ):
        """
        Return a queryset of indicator values filtered by various parameters.

        :param date_data: Filter values up to this date.
        :type date_data: date, optional
        :param min_date_data: Filter values from this date onwards.
        :type min_date_data: date, optional
        :param reference_layer: Reference layer context for filtering.
        :type reference_layer: ReferenceLayerView or None
        :param countries_id: List of country IDs to filter.
        :type countries_id: list[int], optional
        :param admin_level: Filter by administrative level.
        :type admin_level: int, optional
        :param concept_uuid: Filter by a single concept UUID.
        :type concept_uuid: str, optional
        :param concept_uuids: Filter by multiple concept UUIDs.
        :type concept_uuids: list[str], optional
        :param entities_id: Filter by entity IDs.
        :type entities_id: list[int], optional
        :return: QuerySet of filtered IndicatorValueWithGeo objects.
        :rtype: django.db.models.query.QuerySet
        """
        from geosight.data.models.indicator.indicator_value import (
            IndicatorValueWithGeo
        )
        query = IndicatorValueWithGeo.objects.filter(
            indicator_id=self.id
        )

        # Convert to date
        if isinstance(date_data, datetime):
            date_data = date_data.date()
        if isinstance(min_date_data, datetime):
            min_date_data = min_date_data.date()

        # Do filter
        if reference_layer:
            query = query.filter(reference_layer_id=reference_layer.id)
        if countries_id:
            query = query.filter(country_id__in=countries_id)
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
        if entities_id:
            query = query.filter(entity_id__in=entities_id)
        return query

    def rule_by_value(self, value, rule_set=None):
        """
        Return the indicator rule that matches a given value.

        :param value: The value to evaluate against rules.
        :type value: any
        :param rule_set:
            Optional set of rules to evaluate. Defaults to all rules.
        :type rule_set: QuerySet, optional
        :return: Matching indicator rule or None if no match.
        :rtype: IndicatorRule or None
        """
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
            concept_uuids: list = None, last_value=True,
            entities_id: list = None
    ):
        """
        Return a list of indicator values filtered by parameters.

        If multiple values exist for the same entity,
        it can return only the latest value per entity/concept combination.

        :param date_data: Upper date limit for filtering.
        :type date_data: date, optional
        :param min_date_data: Lower date limit for filtering.
        :type min_date_data: date, optional
        :param reference_layer: Optional reference layer filter.
        :type reference_layer: ReferenceLayerView or None
        :param admin_level: Optional admin level filter.
        :type admin_level: int, optional
        :param concept_uuids: Optional list of concept UUIDs to filter.
        :type concept_uuids: list[str], optional
        :param last_value:
            If True, return only the latest value per entity/concept.
        :type last_value: bool
        :param entities_id: Optional list of entity IDs to filter.
        :type entities_id: list[int], optional
        :return: QuerySet of filtered indicator values.
        :rtype: django.db.models.query.QuerySet
        """
        query = self.query_values(
            date_data=date_data,
            min_date_data=min_date_data,
            reference_layer=reference_layer,
            admin_level=admin_level,
            concept_uuids=concept_uuids,
            entities_id=entities_id
        )
        query = query.order_by(
            'concept_uuid', 'geom_id', '-date'
        )
        if last_value:
            query = query.distinct('geom_id', 'concept_uuid')
        return query

    def update_dashboard_version(self):
        """
        Update the version timestamp of dashboards containing this indicator.

        This ensures dashboards reflect the
        latest changes to the indicator values.
        """
        from django.utils import timezone
        from geosight.data.models.dashboard import Dashboard
        Dashboard.objects.filter(
            id__in=self.dashboardindicator_set.values_list(
                'dashboard', flat=True
            )
        ).update(version_data=timezone.now())

    @staticmethod
    def search(name, description):
        """
        Search indicators by name and description using similarity matching.

        :param name: Name string to search for.
        :type name: str
        :param description: Description string to search for.
        :type description: str
        :return:
            List of dictionaries with search results
            including similarity scores.
        :rtype: list[dict]
        """
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

    def metadata(self, reference_layer, is_using_uuid=False):
        """
        Retrieve metadata for the indicator filtered by a reference layer.

        :param reference_layer: The reference layer view.
        :type reference_layer: ReferenceLayerView
        :param is_using_uuid: Whether to use UUID-based filtering.
        :type is_using_uuid: bool
        :return: Metadata dictionary.
        :rtype: dict
        """
        from geosight.data.models.indicator.utilities import (
            metadata_indicator_by_view
        )
        return metadata_indicator_by_view(self, reference_layer, is_using_uuid)

    def metadata_with_cache(self, reference_layer, is_using_uuid=False):
        """
        Retrieve cached metadata for this indicator.

        :param reference_layer: The reference layer view.
        :type reference_layer: ReferenceLayerView
        :param is_using_uuid: Whether to use UUID-based filtering.
        :type is_using_uuid: bool
        :return: Cached metadata dictionary.
        :rtype: dict
        """
        from core.cache import VersionCache
        version = self.version_with_reference_layer_uuid(
            reference_layer.version_with_uuid
        )
        cache = VersionCache(
            key=(
                f'METADATA : '
                f'Indicator {self.id} - {reference_layer.identifier}',
                f'Is_using_uuid {is_using_uuid}'
            ),
            version=version
        )
        cache_data = cache.get()
        if cache_data:
            return cache_data

        response = self.metadata(reference_layer, is_using_uuid)
        response['version'] = cache.version
        cache.set(response)
        return response

    def update_indicator_value_data(self):
        """Update indicator data in indicator value."""
        shortcode = pg_value(self.shortcode)
        name = pg_value(self.name)
        query = f"""
            UPDATE geosight_data_indicatorvalue
            SET
                indicator_name = {name},
                indicator_shortcode = {shortcode}
            WHERE
                indicator_id = {self.id}
        """
        with connection.cursor() as cursor:
            cursor.execute(query)


@receiver(pre_save, sender=Indicator)
def update_indicator_value_data(  # noqa: DOC101,DOC103
        sender, instance, **kwargs
):
    """Update indicator value when Indicator changed."""
    if not instance._state.adding:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            if (
                    old_instance.name != instance.name or
                    old_instance.shortcode != instance.shortcode
            ):
                instance.update_indicator_value_data()
        except ObjectDoesNotExist:
            pass


@receiver(post_save, sender=Indicator)
def increase_version(sender, instance, **kwargs):  # noqa: DOC101,DOC103
    """Increase version of dashboard signal."""
    instance.update_dashboard_version()
