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


import json
import os
import random
from pathlib import Path


"""
Shared auth, parameter pool, and HTTP helpers for GeoSight load tests.

Environment variables
---------------------
GEOSIGHT_API_KEY    — required unless IS_PUBLIC_DASHBOARD=true; your API token
IS_PUBLIC_DASHBOARD — set to "true" to skip authentication entirely
PARAMS_PATH         — optional; path to params.json (default: data/params.json)
"""

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
_is_public = (
    os.environ.get("IS_PUBLIC_DASHBOARD", "").strip().lower() == "true"
)
_api_key = os.environ.get("GEOSIGHT_API_KEY", "")

if not _is_public and not _api_key:
    raise EnvironmentError(
        "GEOSIGHT_API_KEY is not set.\n"
        "Run:  export GEOSIGHT_API_KEY=your_token_here\n"
        "Or:   export IS_PUBLIC_DASHBOARD=true  (for public dashboards)"
    )

AUTH_HEADERS = {} if _is_public else {"Authorization": f"Token {_api_key}"}

# ---------------------------------------------------------------------------
# Parameter pool
# ---------------------------------------------------------------------------
_params_path = Path(os.environ.get("PARAMS_PATH", "data/params.json"))

try:
    with _params_path.open() as _f:
        _p = json.load(_f)
except FileNotFoundError:
    raise FileNotFoundError(
        f"params.json not found at {_params_path}.\n"
        "Place it in the data directory."
    )
except json.JSONDecodeError as exc:
    raise ValueError(f"params.json is not valid JSON: {exc}") from exc

_REQUIRED = [
    "dashboard_slugs",
    "arcgis_proxy_ids",
    "arcgis_proxy_urls",
    "reference_layer_uuids",
    "indicator_values",
    "related_tables",
    "indicator_data",
    "indicators_bulk_data",
    "indicator_statistics",
]
_missing = [k for k in _REQUIRED if not _p.get(k)]
if _missing:
    raise ValueError(f"params.json missing/empty keys: {', '.join(_missing)}")

# Flat pools
DASHBOARD_SLUGS: list[str] = _p["dashboard_slugs"]
ARCGIS_PROXY_IDS: list[int] = _p["arcgis_proxy_ids"]
ARCGIS_PROXY_URLS: list[str] = _p["arcgis_proxy_urls"]
REFERENCE_LAYER_UUIDS: list[str] = _p["reference_layer_uuids"]
INDICATOR_LAYER_IDS: list[int] = _p.get("indicator_layer_ids", [])
REFERENCE_DATASET_UUIDS: list[str] = _p.get("reference_dataset_uuids", [])
RELATED_TABLE_DETAIL_IDS: list[int] = _p.get("related_table_detail_ids", [])

# indicator/values sub-pools
_iv = _p["indicator_values"]
IV_INDICATOR_IDS: list[int] = _iv["indicator_ids"]
IV_GEOM_IDS: list[str] = _iv["geom_ids"]
IV_FREQUENCIES: list[str] = _iv["frequencies"]

# Structured pools (each entry maps directly to a request)
RELATED_TABLES: list[dict] = _p["related_tables"]
INDICATOR_DATA: list[dict] = _p["indicator_data"]
INDICATORS_BULK_DATA: list[dict] = _p["indicators_bulk_data"]
INDICATOR_STATISTICS: list[dict] = _p["indicator_statistics"]

if _is_public:
    print('[auth] Running in public mode (no authentication)')
else:
    print('[auth] Using token authentication with provided API key')
print(
    f"\n[params] Loaded from {_params_path}\n"
    f"  dashboard_slugs      : {DASHBOARD_SLUGS}\n"
    f"  arcgis_proxy_ids     : {ARCGIS_PROXY_IDS}\n"
    f"  arcgis_proxy_urls    : {ARCGIS_PROXY_URLS}\n"
    f"  reference_layer_uuids: {REFERENCE_LAYER_UUIDS}\n"
    f"  indicator_layer_ids  : {INDICATOR_LAYER_IDS}\n"
    f"  reference_dataset_uuids: {REFERENCE_DATASET_UUIDS}\n"
    f"  related_table_detail_ids: {RELATED_TABLE_DETAIL_IDS}\n"
    f"  indicator_values     : ids={IV_INDICATOR_IDS} "
    f"geom_ids={IV_GEOM_IDS} frequencies={IV_FREQUENCIES}\n"
    f"  related_tables       : {len(RELATED_TABLES)} entry/entries\n"
    f"  indicator_data       : {len(INDICATOR_DATA)} entry/entries\n"
    f"  indicators_bulk_data : {len(INDICATORS_BULK_DATA)} entry/entries\n"
    f"  indicator_statistics : {len(INDICATOR_STATISTICS)} entry/entries\n"
)

# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


def get(user, path, *, name, params=None, ok_statuses=(200,)):
    """Shared GET with auth headers and response validation.

    :param user: the Locust user making the request
    :type user: locust.User
    :param path: the URL path to request (relative to host)
    :type path: str
    :param name: the name to use for this request in reports
    :type name: str
    :param params: optional query parameters to include in the request
    :type params: dict or None
    :param ok_statuses: HTTP status codes to treat as success (default: (200,))
    :type ok_statuses: tuple[int]
    :return: the response object from the request
    :rtype: requests.Response
    """
    with user.client.get(
        path,
        headers=AUTH_HEADERS,
        params=params,
        name=name,
        catch_response=True,
    ) as resp:
        if resp.status_code in ok_statuses:
            resp.success()
        else:
            resp.failure(f"{name} → HTTP {resp.status_code}")
    return resp


def post(user, path, *, name, json_payload=None, ok_statuses=(200,)):
    """Shared POST with auth headers and response validation.

    :param user: the Locust user making the request
    :type user: locust.User
    :param path: the URL path to request (relative to host)
    :type path: str
    :param name: the name to use for this request in reports
    :type name: str
    :param json_payload: optional JSON payload to include in the request body
    :type json_payload: dict or None
    :param ok_statuses: HTTP status codes to treat as success (default: (200,))
    :type ok_statuses: tuple[int]
    :return: the response object from the request
    :rtype: requests.Response
    """
    with user.client.post(
        path,
        headers={**AUTH_HEADERS, "Content-Type": "application/json"},
        json=json_payload,
        name=name,
        catch_response=True,
    ) as resp:
        if resp.status_code in ok_statuses:
            resp.success()
        else:
            resp.failure(f"{name} → HTTP {resp.status_code}")
    return resp


# ---------------------------------------------------------------------------
# Param builders
# ---------------------------------------------------------------------------


def indicator_values_params():
    """Pick a random (indicator_id, geom_id, frequency) combination.

    :return: tuple of (indicator_id, geom_id, frequency)
    :rtype: tuple[int, str, str]
    """
    return (
        random.choice(IV_INDICATOR_IDS),
        random.choice(IV_GEOM_IDS),
        random.choice(IV_FREQUENCIES),
    )


def indicator_data_params(entry: dict) -> dict:
    """Build query params for /indicators/{id}/data/ from a pool entry.

    :param entry: a pool entry containing indicator data
    :type entry: dict
    :return: query parameters for the request
    :rtype: dict
    """
    return {k: v for k, v in entry.items() if k != "indicator_id"}


def indicator_stat_params(entry: dict) -> dict:
    """Build query params for /indicators/{id}/data/statistic/.

    :param entry: a pool entry containing indicator data
    :type entry: dict
    :return: query parameters for the request
    :rtype: dict
    """
    return {k: v for k, v in entry.items() if k != "indicator_id"}
