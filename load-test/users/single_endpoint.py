# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '21/02/2026'
__copyright__ = ('Copyright 2026, Unicef')

import random

from locust import FastHttpUser, task, between

from .common import (
    DASHBOARD_SLUGS,
    INDICATOR_LAYER_IDS,
    REFERENCE_DATASET_UUIDS,
    RELATED_TABLE_DETAIL_IDS,
    RELATED_TABLES,
    INDICATOR_DATA,
    INDICATORS_BULK_DATA,
    INDICATOR_STATISTICS,
    IV_INDICATOR_IDS,
    REFERENCE_LAYER_UUIDS,
    get,
    post,
    indicator_values_params,
    indicator_data_params,
    indicator_stat_params,
)


"""
Single-endpoint user classes.

Each class hammers exactly one API endpoint, making it easy to isolate
and benchmark a specific endpoint via the Locust UI class-picker or CLI.

Available classes
-----------------
  DashboardDataUser        — GET /api/dashboard/[slug]/data
  DashboardBookmarksUser   — GET /api/dashboard/[slug]/bookmarks
  IndicatorMetadataUser    — POST /api/indicator/metadata
  RelatedTableDatesUser    — GET /api/v1/related-tables/[id]/geo-data/dates/
  IndicatorDataUser        — GET /api/v1/indicators/[id]/data/
  IndicatorsBulkDataUser   — GET /api/v1/indicators/data/
  IndicatorStatisticUser   — GET /api/v1/indicators/[id]/data/statistic/
  IndicatorValuesUser      — GET /api/v1/indicators/[id]/data/values/
  IndicatorLayerUser       — GET /api/dashboard/[slug]/indicator-layer/[id]
  ReferenceDatasetsUser    — GET /api/v1/reference-datasets/[uuid]/
  RelatedTableDetailUser   — GET /api/related-table/[id]/
  RelatedTableDataUser     — GET /api/related-table/[id]/data

Usage — UI class-picker (select one endpoint in the browser)
-----
    locust -f locustfile.py --host=https://geosight.unicef.org --class-picker

Usage — headless, single endpoint
-----
    locust -f locustfile.py --host=https://geosight.unicef.org \\
        --headless -u 20 -r 2 --run-time 2m --csv=results \\
        IndicatorValuesUser
"""


class DashboardDataUser(FastHttpUser):
    """Hits GET /api/dashboard/[slug]/data exclusively."""

    wait_time = between(1, 4)

    @task
    def load_dashboard_data(self):
        """Fetch dashboard data for one dashboard."""
        slug = random.choice(DASHBOARD_SLUGS)
        get(
            self,
            f"/api/dashboard/{slug}/data",
            name="/api/dashboard/[slug]/data",
        )


class DashboardBookmarksUser(FastHttpUser):
    """Hits GET /api/dashboard/[slug]/bookmarks exclusively."""

    wait_time = between(1, 4)

    @task
    def load_dashboard_bookmarks(self):
        """Fetch bookmarks for the current dashboard."""
        slug = random.choice(DASHBOARD_SLUGS)
        get(
            self,
            f"/api/dashboard/{slug}/bookmarks",
            name="/api/dashboard/[slug]/bookmarks",
            ok_statuses=(200, 204),
        )


class IndicatorMetadataUser(FastHttpUser):
    """Hits POST /api/indicator/metadata exclusively."""

    wait_time = between(1, 4)

    @task
    def load_indicator_metadata(self):
        """Fetch indicator metadata."""
        reference_layer_uuid = random.choice(REFERENCE_LAYER_UUIDS)
        post(
            self,
            "/api/indicator/metadata?"
            f"reference_layer_uuid={reference_layer_uuid}",
            json_payload=IV_INDICATOR_IDS,
            name="/api/indicator/metadata",
        )


class RelatedTableDatesUser(FastHttpUser):
    """Hits GET /api/v1/related-tables/[id]/geo-data/dates/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_related_table_dates(self):
        """Fetch related table dates for one related table.

        :return: None
        """
        if not RELATED_TABLES:
            return
        entry = random.choice(RELATED_TABLES)
        rt_id = entry["id"]
        get(
            self,
            f"/api/v1/related-tables/{rt_id}/geo-data/dates/",
            params={k: v for k, v in entry.items() if k != "id"},
            name="/api/v1/related-tables/[id]/geo-data/dates/",
        )


class IndicatorDataUser(FastHttpUser):
    """Hits GET /api/v1/indicators/[id]/data/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_indicator_data(self):
        """Fetch indicator data for one indicator."""
        entry = random.choice(INDICATOR_DATA)
        get(
            self,
            f"/api/v1/indicators/{entry['indicator_id']}/data/",
            params=indicator_data_params(entry),
            name="/api/v1/indicators/[id]/data/",
        )


class IndicatorsBulkDataUser(FastHttpUser):
    """Hits GET /api/v1/indicators/data/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_indicators_bulk_data(self):
        """Fetch bulk data for multiple indicators.

        :return: None
        """
        if not INDICATORS_BULK_DATA:
            return
        entry = random.choice(INDICATORS_BULK_DATA)
        get(
            self,
            "/api/v1/indicators/data/",
            params=entry,
            name="/api/v1/indicators/data/",
        )


class IndicatorStatisticUser(FastHttpUser):
    """Hits GET /api/v1/indicators/[id]/data/statistic/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_indicator_statistic(self):
        """Fetch indicator statistic for one indicator."""
        entry = random.choice(INDICATOR_STATISTICS)
        get(
            self,
            f"/api/v1/indicators/{entry['indicator_id']}/data/statistic/",
            params=indicator_stat_params(entry),
            name="/api/v1/indicators/[id]/data/statistic/",
        )


class IndicatorValuesUser(FastHttpUser):
    """Hits GET /api/v1/indicators/[id]/data/values/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_indicator_values(self):
        """Fetch indicator values for one indicator.

        :return: None
        """
        ind_id, geom_id, frequency = indicator_values_params()
        if geom_id is None and frequency is None:
            return  # Skip if no valid combos
        get(
            self,
            f"/api/v1/indicators/{ind_id}/data/values/",
            params={"frequency": frequency, "geom_id": geom_id},
            name="/api/v1/indicators/[id]/data/values/",
        )


class IndicatorLayerUser(FastHttpUser):
    """Hits GET /api/dashboard/[slug]/indicator-layer/[id] exclusively."""

    wait_time = between(1, 4)

    @task
    def load_indicator_layer(self):
        """Fetch indicator layer details for one dashboard.

        :return: None
        """
        if not INDICATOR_LAYER_IDS:
            return
        slug = random.choice(DASHBOARD_SLUGS)
        layer_id = random.choice(INDICATOR_LAYER_IDS)
        get(
            self,
            f"/api/dashboard/{slug}/indicator-layer/{layer_id}",
            name="/api/dashboard/[slug]/indicator-layer/[id]",
        )


class ReferenceDatasetsUser(FastHttpUser):
    """Hits GET /api/v1/reference-datasets/[uuid]/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_reference_dataset(self):
        """Fetch reference dataset details if available.

        :return: None
        """
        if not REFERENCE_DATASET_UUIDS:
            return
        uuid = random.choice(REFERENCE_DATASET_UUIDS)
        get(
            self,
            f"/api/v1/reference-datasets/{uuid}/",
            name="/api/v1/reference-datasets/[uuid]/",
        )


class RelatedTableDetailUser(FastHttpUser):
    """Hits GET /api/related-table/[id]/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_related_table_detail(self):
        """Fetch related table details if available.

        :return: None
        """
        if not RELATED_TABLE_DETAIL_IDS:
            return
        rt_id = random.choice(RELATED_TABLE_DETAIL_IDS)
        get(
            self,
            f"/api/related-table/{rt_id}/",
            name="/api/related-table/[id]/",
        )


class RelatedTableDataUser(FastHttpUser):
    """Hits GET /api/related-table/[id]/data exclusively."""

    wait_time = between(1, 4)

    @task
    def load_related_table_data(self):
        """Fetch related table data if detail is available.

        :return: None
        """
        if not RELATED_TABLE_DETAIL_IDS:
            return
        rt_id = random.choice(RELATED_TABLE_DETAIL_IDS)
        get(
            self,
            f"/api/related-table/{rt_id}/data",
            name="/api/related-table/[id]/data",
        )
