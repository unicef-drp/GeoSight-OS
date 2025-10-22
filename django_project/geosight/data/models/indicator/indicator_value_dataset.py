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
__date__ = '05/12/2023'
__copyright__ = ('Copyright 2023, Unicef')

from django.contrib.gis.db import models

from geosight.data.models.indicator import Indicator


class IndicatorValueDataset(models.Model):
    """Indicator value x entity view x admin level."""

    id = models.CharField(max_length=256, primary_key=True)
    string_id = models.CharField(max_length=256)

    # Indicator
    indicator_id = models.BigIntegerField()
    indicator_name = models.CharField(
        max_length=256, null=True, blank=True
    )
    indicator_shortcode = models.CharField(
        max_length=512, null=True, blank=True
    )

    # Country
    country_id = models.BigIntegerField()
    country_name = models.CharField(
        max_length=256, null=True, blank=True
    )
    country_geom_id = models.CharField(
        max_length=256, null=True, blank=True
    )
    admin_level = models.CharField(max_length=256)

    data_count = models.IntegerField(
        null=True, blank=True
    )
    start_date = models.DateField(
        null=True, blank=True
    )
    end_date = models.DateField(
        null=True, blank=True
    )

    class Meta:  # noqa: D106
        managed = False
        db_table = "no_table"

    @property
    def indicator(self):
        """Return the related object.

        This property attempts to retrieve the full :class:`Indicator`
        instance associated with this dataset via its ``indicator_id``.

        :return: The related indicator instance, or ``None`` if not found.
        :rtype: Indicator or None
        """
        try:
            return Indicator.objects.get(id=self.indicator_id)
        except Indicator.DoesNotExist:
            return None

    def permissions(self, user):
        """Return the user's permissions for this indicator dataset.

        Delegates permission checking to the associated
        :class:`~geosight.data.models.indicator.Indicator` instance.

        :param user: The user for whom permissions are being checked.
        :type user: django.contrib.auth.models.User
        :return: A dictionary or object containing permission details
                 (e.g., ``{"view": True, "edit": False, "delete": False}``).
        :rtype: dict or Any
        """
        return self.indicator.permission.all_permission(user)
