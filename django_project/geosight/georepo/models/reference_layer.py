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

import logging

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Max, Subquery
from django.utils.translation import ugettext_lazy as _

from core.models.general import AbstractVersionData, AbstractEditData
from geosight.data.models.indicator import Indicator
from geosight.georepo.request import (
    GeorepoRequest, GeorepoUrl, GeorepoRequestError
)
from geosight.georepo.request.data import GeorepoEntity
from geosight.georepo.term import admin_level_country
from geosight.permission.models.manager import PermissionManager

User = get_user_model()

logger = logging.getLogger(__name__)


class ReferenceLayerView(AbstractEditData, AbstractVersionData):
    """Reference Layer view data."""

    identifier = models.CharField(
        max_length=256,
        help_text=_("Reference layer identifier.")
    )

    name = models.CharField(
        max_length=256,
        help_text=_("Reference layer name."),
        null=True, blank=True
    )

    description = models.TextField(
        null=True, blank=True
    )

    in_georepo = models.BooleanField(default=True)

    # Country
    countries = models.ManyToManyField(
        'geosight_georepo.Entity',
        help_text=_('The country of the view.'),
        null=True
    )

    # Tags of the view
    tags = models.JSONField(
        null=True,
        blank=True
    )

    class Meta:  # noqa: D106
        indexes = [
            models.Index(
                fields=['identifier'],
                name='reference_layer_identifier'
            )
        ]

    def get_name(self):
        """
        Retrieve the name of the reference layer view.

        If the `name` attribute is not set but the `identifier` exists,
        attempts to update metadata from the remote GeoRepo server.
        If the update fails with `GeorepoRequestError`,
        the error is silently ignored.

        :return: The name of the reference layer view.
        :rtype: str
        """
        if not self.name and self.identifier:
            try:
                self.update_meta()
            except GeorepoRequestError:
                pass
        return self.name

    def __str__(self):  # noqa DOC201
        """Return str."""
        return f'{self.get_name()} ({self.identifier})'

    @property
    def version_with_uuid(self):
        """Return version data."""
        return f'{self.identifier}-{self.version}'

    def save(self, *args, **kwargs):  # noqa DOC101
        """Save the ReferenceLayerView instance."""
        from geosight.georepo.tasks import fetch_reference_codes
        from geosight.georepo.tasks import (
            create_data_access_reference_layer_view
        )
        super(ReferenceLayerView, self).save(*args, **kwargs)
        if not self.name:
            self.get_name()
            fetch_reference_codes.delay(self.id)
            create_data_access_reference_layer_view.delay(self.id)

    def update_meta(self):
        """Update the metadata from the GeoRepo remote server."""
        detail = GeorepoRequest().View.get_detail(self.identifier)
        self.name = detail['name']
        self.tags = detail['tags']
        self.description = detail['description']
        self.in_georepo = True
        self.save()

    def full_name(self):
        """
        Return the full name of the reference dataset.

        :return: The full name string.
        :rtype: str
        """
        return f'{self.get_name()} ({self.identifier})'

    def bbox(self):
        """
        Return bbox of reference layer.

        :return:
            The bounding box of the reference layer,
            typically as a list or tuple of coordinates.
        :rtype: list | tuple | Any
        """
        return GeorepoRequest().View.get_reference_layer_bbox(self.identifier)

    def entities(self, level=None):
        """
        Retrieve entities associated with the reference layer view.

        Calls the `get_detail` method of `GeorepoRequest().View` using
        the instance's identifier to fetch detailed entity information.

        :param level: Optional level to filter entities (currently unused).
        :type level: optional
        :return:
            Detailed information of entities related to this reference layer.
        :rtype: dict
        """
        return GeorepoRequest().View.get_detail(self.identifier)

    def save_entity(self, entity: GeorepoEntity):
        """Save entity that is found on GeorepoEntity.

        :param entity: Entity to be saved.
        :type entity: GeorepoEntity

        :return: The entity object that is created.
        :rtype: Entity
        """
        from geosight.georepo.models.entity import EntityCode
        georepo_entity = GeorepoEntity(entity)
        obj, _ = GeorepoEntity(entity).get_or_create(self)
        for code_type, code in georepo_entity.ext_codes.items():
            entity_code, _ = EntityCode.objects.get_or_create(
                entity=obj,
                code_type=code_type,
                code=code
            )
        return obj

    def sync_entities_code(self, level=None, sync_all=True):
        """Sync entities code.

        Sync entities code from georepo remote server.
        :param level: Optional level to filter which entities to synchronize.
        :type level: Optional[Any], defaults to None
        :param sync_all:
            Whether to synchronize all entities regardless of level.
            Defaults to True.
        :type sync_all: bool, optional
        """
        min_level = None
        if not sync_all:
            try:
                min_level = self.entities_set.aggregate(
                    Max('admin_level')
                )['admin_level__max']
            except KeyError:
                pass
        detail = GeorepoRequest().View.get_detail(self.identifier)
        logger.debug(f"Fetching entities: {self.identifier}")
        for dataset_level in detail['dataset_levels']:
            if level and dataset_level['level'] != level:
                continue
            if min_level is not None and dataset_level['level'] <= min_level:
                continue
            logger.debug(
                f"Fetching entities: "
                f"{self.identifier}-{dataset_level['level']}"
            )
            entities = GeorepoRequest().View.entities(
                self.identifier, dataset_level['level']
            )
            for entity in entities:
                self.save_entity(entity)

    @property
    def detail_url(self):
        """Return API link for reference detail."""
        url = GeorepoUrl()
        return url.view_detail(self.identifier)

    @property
    def is_local(self):
        """Return if view is local or not."""
        return not self.in_georepo

    @property
    def entities_set(self):
        """
        Return a queryset of entities related to this reference layer view.

        :return: A queryset of related `Entity` instances.
        :rtype: QuerySet[Entity]
        """
        from geosight.georepo.models.entity import Entity
        # TODO:
        #  We will fix this after we migrate to production
        related_entities = self.referencelayerviewentity_set.values(
            "entity_id"
        )
        return Entity.objects.filter(pk__in=Subquery(related_entities))

    def assign_countries(self):
        """Assign all entities from the entity set to the countries field."""
        self.countries.set(
            self.entities_set.filter(admin_level=admin_level_country)
        )
        self.save()

    def assign_country(self, entity, check_entity=True):
        """
        Assign a country-level entity to the reference layer view.

        :param entity: The entity to evaluate and possibly assign as a country.
        :type entity: Entity
        :param check_entity:
            Whether to check if the entity is already in the entities set.
            If True, the entity must exist in `entities_set` to be assigned.
        :type check_entity: bool
        """
        if entity.admin_level == admin_level_country:
            if (
                    not check_entity or
                    self.entities_set.filter(id=entity.id).exists()
            ):
                self.countries.add(entity)

    @staticmethod
    def get_priority_view(views):
        """
        Return the priority view from a list of views.

        This method selects a single view from
        the given list with the following priority:
        1. If any view has a tag containing the string 'latest',
            that view is returned.
        2. If no such view exists, the first view in the list is returned.

        If the input list is empty, None is returned.

        :param views: A list of view instances to evaluate.
        :type views: list[View]

        :return: The prioritized view, or None if the list is empty.
        :rtype: View or None
        """
        if not len(views):
            return None

        # Check the latest tag
        for view in views:
            if view.tags and 'latest' in view.tags:
                return view

        return views[0]

    @staticmethod
    def get_priority_view_by_country(country, tag=None):
        """
        Return the priority view for a given country.

        This method returns a single view associated with the country.
        If a tag is provided, it prioritizes views matching the latest tags.
        If no such view exists or no tag is given, it falls back to returning
        the first available view for the country.

        :param country: The country object or identifier to filter views by.
        :type country: Country
        :param tag: Optional tag used to prioritize matching views.
        :type tag: str
        :return: A single prioritized view instance, or None if not found.
        :rtype: View or None
        """
        views = ReferenceLayerView.objects.filter(
            countries__id=country.id
        )
        if tag:
            views = views.filter(
                tags__contains=tag
            )
        else:
            # Just the view with 1 country
            views = [view for view in views if view.countries.count() == 1]

        return ReferenceLayerView.get_priority_view(views)


class ReferenceLayerIndicator(models.Model):
    """Reference Layer x Indicator data."""

    reference_layer = models.ForeignKey(
        ReferenceLayerView, on_delete=models.CASCADE
    )
    indicator = models.ForeignKey(
        Indicator, on_delete=models.CASCADE
    )

    objects = models.Manager()
    permissions = PermissionManager()

    class Meta:  # noqa: D106
        unique_together = ('reference_layer', 'indicator')

    @property
    def creator(self):
        """Return creator from the indicator."""
        return self.indicator.creator

    @property
    def created_at(self):
        """Return created time from the indicator."""
        return self.indicator.created_at

    @property
    def modified_at(self):
        """Return modified time from the indicator."""
        return self.indicator.modified_at
