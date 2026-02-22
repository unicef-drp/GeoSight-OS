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
import time

from locust import FastHttpUser, SequentialTaskSet, task, between

from .common import (
    DASHBOARD_SLUGS,
    INDICATOR_LAYER_IDS,
    REFERENCE_DATASET_UUIDS,
    REFERENCE_LAYER_UUIDS,
    RELATED_TABLE_DETAIL_IDS,
    RELATED_TABLES,
    INDICATOR_DATA,
    INDICATORS_BULK_DATA,
    INDICATOR_STATISTICS,
    IV_INDICATOR_IDS,
    get,
    post,
    indicator_values_params,
    indicator_data_params,
    indicator_stat_params,
)

"""
Full Journey User — Sequential scenario.

Replays the complete browser request waterfall for a dashboard session:

  1.  Dashboard data
  2.  Bookmarks
  3.  Indicator metadata
  4.  Indicator layer          (/api/dashboard/{slug}/indicator-layer/{id})
  5.  Reference dataset        (/api/v1/reference-datasets/{uuid}/)
  6.  Related-table dates
  7.  Indicator data           (/api/v1/indicators/{id}/data/)
  8.  Indicators bulk data     (/api/v1/indicators/data/)
  9.  Indicator statistics     (all pool entries, mirrors browser waterfall)
  10. Indicator values         (2-4 random combos, mimics map clicks)

  Below steps are currently disabled
  because they don't support token authentication yet:
  7.  Related-table detail     (/api/related-table/{id}/)
  8.  Related-table data       (/api/related-table/{id}/data)

Usage
-----
    locust -f locustfile.py --host=https://geosight.unicef.org \\
        --headless -u 10 -r 2 --run-time 5m \\
        FullJourneyUser
"""


class FullJourneyTaskSet(SequentialTaskSet):
    """Sequential steps that mirror the actual request waterfall."""

    def on_start(self):
        """Randomly pick parameter values for this user from the pools."""
        self.slug = random.choice(DASHBOARD_SLUGS)
        self.uuid = random.choice(REFERENCE_LAYER_UUIDS)
        self.indicator_layer_id = (
            random.choice(INDICATOR_LAYER_IDS) if INDICATOR_LAYER_IDS else None
        )
        self.reference_dataset_uuid = (
            random.choice(REFERENCE_DATASET_UUIDS)
            if REFERENCE_DATASET_UUIDS
            else None
        )
        self.related_table_detail_id = (
            random.choice(RELATED_TABLE_DETAIL_IDS)
            if RELATED_TABLE_DETAIL_IDS
            else None
        )
        self.rt_entry = random.choice(RELATED_TABLES)
        self.data_entry = random.choice(INDICATOR_DATA)
        self.bulk_data_entry = random.choice(INDICATORS_BULK_DATA)
        # Simulate the browser firing statistics requests for every indicator
        # in the pool (as seen in the original waterfall)
        self.stat_entries = INDICATOR_STATISTICS
        # 2–4 random (indicator, geom, frequency) combos for the values drills
        self.drills = [
            indicator_values_params() for _ in range(random.randint(2, 4))
        ]

    @task
    def step_1_dashboard_data(self):
        """Fetch dashboard data."""
        get(
            self,
            f"/api/dashboard/{self.slug}/data",
            name="/api/dashboard/[slug]/data",
        )

    @task
    def step_2_bookmarks(self):
        """Fetch bookmarks for the current dashboard."""
        get(
            self,
            f"/api/dashboard/{self.slug}/bookmarks",
            name="/api/dashboard/[slug]/bookmarks",
            ok_statuses=(200, 204),
        )

    @task
    def step_3_indicator_metadata(self):
        """Fetch indicator metadata."""
        post(
            self,
            "/api/indicator/metadata?"
            f"reference_layer_uuid={self.uuid}",
            json_payload=IV_INDICATOR_IDS,
            name="/api/indicator/metadata",
        )

    @task
    def step_4_indicator_layer(self):
        """Fetch indicator layer details if available.

        :return: None
        """
        if self.indicator_layer_id is None:
            return
        get(
            self,
            f"/api/dashboard/{self.slug}/indicator-layer/"
            f"{self.indicator_layer_id}",
            name="/api/dashboard/[slug]/indicator-layer/[id]",
        )

    @task
    def step_5_reference_dataset(self):
        """Fetch reference dataset details if available.

        :return: None
        """
        if self.reference_dataset_uuid is None:
            return
        get(
            self,
            f"/api/v1/reference-datasets/{self.reference_dataset_uuid}/",
            name="/api/v1/reference-datasets/[uuid]/",
        )

    @task
    def step_6_related_table_dates(self):
        """Fetch related table dates for one related table."""
        rt_id = self.rt_entry["id"]
        get(
            self,
            f"/api/v1/related-tables/{rt_id}/geo-data/dates/",
            params={k: v for k, v in self.rt_entry.items() if k != "id"},
            name="/api/v1/related-tables/[id]/geo-data/dates/",
        )

    @task
    def step_7_indicator_data(self):
        """Fetch indicator data for one indicator."""
        entry = self.data_entry
        get(
            self,
            f"/api/v1/indicators/{entry['indicator_id']}/data/",
            params=indicator_data_params(entry),
            name="/api/v1/indicators/[id]/data/",
        )

    @task
    def step_8_indicators_bulk_data(self):
        """Fetch bulk data for multiple indicators."""
        get(
            self,
            "/api/v1/indicators/data/",
            params=self.bulk_data_entry,
            name="/api/v1/indicators/data/",
        )

    @task
    def step_9_indicator_statistics(self):
        """Fire statistics requests for all indicators in the pool."""
        for entry in self.stat_entries:
            get(
                self,
                f"/api/v1/indicators/{entry['indicator_id']}/data/statistic/",
                params=indicator_stat_params(entry),
                name="/api/v1/indicators/[id]/data/statistic/",
            )
            time.sleep(random.uniform(0.2, 0.6))

    @task
    def step_10_indicator_values(self):
        """Drill into indicator values — mimics a user clicking through map."""
        for ind_id, geom_id, frequency in self.drills:
            get(
                self,
                f"/api/v1/indicators/{ind_id}/data/values/",
                params={"frequency": frequency, "geom_id": geom_id},
                name="/api/v1/indicators/[id]/data/values/",
            )
            time.sleep(random.uniform(0.5, 1.5))


    # Related table detail and data steps are commented out because
    # they don't support token authentication yet.
    # Will re-enable once that's in place.
    # @task
    # def step_7_related_table_detail(self):
    #     """Fetch related table details if available.

    #     :return: None
    #     """
    #     if self.related_table_detail_id is None:
    #         return
    #     get(
    #         self,
    #         f"/api/related-table/{self.related_table_detail_id}/",
    #         name="/api/related-table/[id]/",
    #     )

    # @task
    # def step_8_related_table_data(self):
    #     """Fetch related table data if detail is available.

    #     :return: None
    #     """
    #     if self.related_table_detail_id is None:
    #         return
    #     get(
    #         self,
    #         f"/api/related-table/{self.related_table_detail_id}/data",
    #         name="/api/related-table/[id]/data",
    #     )


class FullJourneyUser(FastHttpUser):
    """User who opens a dashboard and actively explores data end-to-end."""

    weight = 1
    wait_time = between(3, 8)
    tasks = [FullJourneyTaskSet]
