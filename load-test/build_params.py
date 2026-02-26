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


import argparse
import json
import logging
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote

from utils import logging_setup

logger = logging.getLogger(__name__)


"""
build_params.py — Build params.json for locustfile.py from a HAR file or
                  a plain text file of URLs (one per line).

Usage
-----
    # From a HAR file (exported from browser DevTools → Network → Export HAR)
    python build_params.py recording.har

    # From a plain text file (one URL per line)
    python build_params.py urls.txt

    # Read from stdin
    cat urls.txt | python build_params.py -

    # Custom output path
    python build_params.py recording.har --output my_params.json

    # Filter to only requests matching a host (useful for HAR files with
    # many third-party requests)
    python build_params.py recording.har --host geosight.unicef.org

    # Only include successful responses (2xx) — HAR only
    python build_params.py recording.har --only-success

    # Overwrite instead of merging into an existing params.json
    python build_params.py recording.har --no-merge

HAR filtering notes
-------------------
- Non-GET/POST requests are skipped by default (OPTIONS/etc.).
- Requests that don't match any known GeoSight API pattern are silently
  ignored, so having third-party CDN/analytics entries in the HAR is fine.
- Duplicate URLs are deduplicated automatically.
"""

# ---------------------------------------------------------------------------
# Path patterns
# ---------------------------------------------------------------------------
RE_INDICATOR_ID = re.compile(r"/indicators/(\d+)/")
RE_RELATED_TABLE_ID = re.compile(r"/related-tables/(\d+)/")
RE_ARCGIS_PROXY_ID = re.compile(r"/arcgis/(\d+)/proxy")
RE_DASHBOARD_SLUG = re.compile(r"/dashboard/([^/]+)/")
RE_INDICATOR_LAYER_ID = re.compile(r"/indicator-layer/(\d+)")
RE_REFERENCE_DATASET_UUID = re.compile(
    r"/reference-datasets/"
    r"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/"  # noqa: E501
)
RE_RELATED_TABLE_DETAIL_ID = re.compile(r"/related-table/(\d+)")


# ---------------------------------------------------------------------------
# Input reading
# ---------------------------------------------------------------------------


def _is_har(text: str) -> bool:
    """Heuristic: HAR files are JSON objects with a top-level 'log' key.

    :param text: the raw input text
    :type text: str
    :return: True if it looks like a HAR file, False otherwise
    :rtype: bool
    """
    stripped = text.lstrip()
    if not stripped.startswith("{"):
        return False
    try:
        obj = json.loads(stripped)
        return "log" in obj and "entries" in obj["log"]
    except json.JSONDecodeError:
        return False


def read_urls_from_har(
    text: str,
    host_filter: str | None = None,
    only_success: bool = False,
) -> list[dict]:
    """
    Extract GET and POST request entries from a HAR file string.

    :param text: the raw HAR file content as a string
    :type text: str
    :param host_filter: optional substring to filter URLs by host
    :type host_filter: str or None
    :param only_success: if True, only include entries with 2xx response status
    :type only_success: bool
    :return: list of dicts with keys: url, method, post_data (optional)
    :rtype: list[dict]
    """
    har = json.loads(text)
    entries = har.get("log", {}).get("entries", [])
    results = []
    skipped_method = skipped_host = skipped_status = 0

    for entry in entries:
        req = entry.get("request", {})
        resp = entry.get("response", {})

        method = req.get("method", "").upper()
        # Only GET and POST requests
        if method not in ("GET", "POST"):
            skipped_method += 1
            continue

        url = req.get("url", "")
        parsed = urlparse(url)

        # Optional host filter
        if host_filter and host_filter not in parsed.netloc:
            skipped_host += 1
            continue

        # Optional success filter
        if only_success:
            status = resp.get("status", 0)
            if not (200 <= status < 300):
                skipped_status += 1
                continue

        result = {"url": url, "method": method}
        if method == "POST":
            post_data = req.get("postData", {})
            result["post_data"] = post_data.get("text", "")
        results.append(result)

    logger.info(
        f"[har] {len(entries)} entries → "
        f"{len(results)} GET/POST requests kept "
        f"(skipped: {skipped_method} non-GET/POST, "
        f"{skipped_host} host-filtered, "
        f"{skipped_status} non-2xx)"
    )
    return results


def read_urls_from_text(text: str) -> list[dict]:
    """Extract URLs from a plain text file (one per line, # comments ignored).

    :param text: the raw text content
    :type text: str
    :return: list of dicts with keys: url, method
    :rtype: list[dict]
    """
    results = []
    for line in text.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            results.append({"url": line, "method": "GET"})
    return results


def load_urls(
    source: str,
    host_filter: str | None = None,
    only_success: bool = False,
) -> list[dict]:
    """
    Load URL entries from *source* (a file path or '-' for stdin).

    Auto-detects HAR vs plain-text format.
    Returns list of dicts with keys: url, method, post_data (optional).

    :param source: file path or '-' for stdin
    :type source: str
    :param host_filter: optional substring to filter URLs by host (HAR only)
    :type host_filter: str or None
    :param only_success: if True, only include entries with 2xx response
        status (HAR only)
    :type only_success: bool
    :return: list of dicts with keys: url, method, post_data (optional)
    :rtype: list[dict]
    """
    if source == "-":
        text = sys.stdin.read()
    else:
        path = Path(source)
        if not path.exists():
            logger.error(f"file not found: {path}")
            sys.exit(1)
        text = path.read_text(encoding="utf-8")

    if _is_har(text):
        logger.info("Detected HAR format")
        return read_urls_from_har(
            text, host_filter=host_filter, only_success=only_success
        )
    else:
        logger.info("Detected plain-text URL list format")
        if only_success:
            logger.warning(
                "--only-success has no effect on plain-text input "
                "(no response data available)."
            )
        return read_urls_from_text(text)


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------


def parse_urls(url_entries: list[dict]) -> list[tuple[str, dict, str, str]]:
    """Return (path, flat_query_params, method, post_data) for each URL entry.

    :param url_entries: list of URL entries
    :type url_entries: list[dict]
    :return: list of tuples (path, flat_query_params, method, post_data)
    :rtype: list[tuple[str, dict, str, str]]
    """
    results = []
    for entry in url_entries:
        parsed = urlparse(entry["url"])
        # Flatten single-value lists from parse_qs
        qs = {k: v[0] for k, v in parse_qs(parsed.query).items()}
        results.append(
            (
                parsed.path,
                qs,
                entry.get("method", "GET"),
                entry.get("post_data", ""),
            )
        )
    return results


def build_params(url_entries: list[tuple[str, dict, str, str]]) -> dict:
    """Accumulate all unique parameter values into the params.json structure.

    :param url_entries: list of tuples (path, flat_query_params, method,
        post_data)
    :type url_entries: list[tuple[str, dict, str, str]]
    :return: dictionary with accumulated parameter values
    :rtype: dict
    """
    dashboard_slugs: set[str] = set()
    arcgis_proxy_ids: set[int] = set()
    arcgis_proxy_urls: set[str] = set()
    reference_layer_uuids: set[str] = set()
    iv_indicator_ids: set[int] = set()
    iv_geom_ids: set[str] = set()
    iv_frequencies: set[str] = set()

    indicator_layer_ids: set[int] = set()
    reference_dataset_uuids: set[str] = set()
    related_table_detail_ids: set[int] = set()

    related_tables: dict[str, dict] = {}
    indicator_data: dict[str, dict] = {}
    indicators_bulk_data: dict[str, dict] = {}
    indicator_statistics: dict[str, dict] = {}

    matched = 0

    for path, qs, method, post_data in url_entries:
        hit = False

        # /api/dashboard/<slug>/data  or  /bookmarks
        m = RE_DASHBOARD_SLUG.search(path)
        if m:
            dashboard_slugs.add(m.group(1))
            hit = True

        # /api/arcgis/<id>/proxy
        m = RE_ARCGIS_PROXY_ID.search(path)
        if m:
            arcgis_proxy_ids.add(int(m.group(1)))
            if "url" in qs:
                arcgis_proxy_urls.add(unquote(qs["url"]))
            hit = True

        # /api/indicator/metadata
        if path == "/api/indicator/metadata":
            if method == "POST" and post_data:
                try:
                    ids = json.loads(post_data)
                    if isinstance(ids, list):
                        for _id in ids:
                            if isinstance(_id, int):
                                iv_indicator_ids.add(_id)
                except json.JSONDecodeError:
                    pass
            if "reference_layer_uuid" in qs:
                reference_layer_uuids.add(qs["reference_layer_uuid"])
            hit = True

        # /api/v1/indicators/<id>/data/values/
        if path.endswith("/data/values/") and RE_INDICATOR_ID.search(path):
            m = RE_INDICATOR_ID.search(path)
            iv_indicator_ids.add(int(m.group(1)))
            if "geom_id" in qs:
                iv_geom_ids.add(qs["geom_id"])
            if "frequency" in qs:
                iv_frequencies.add(qs["frequency"])
            hit = True

        # /api/v1/indicators/<id>/data/statistic/
        if path.endswith("/data/statistic/") and RE_INDICATOR_ID.search(path):
            m = RE_INDICATOR_ID.search(path)
            entry = {"indicator_id": int(m.group(1)), **qs}
            indicator_statistics[json.dumps(entry, sort_keys=True)] = entry
            hit = True

        # /api/v1/indicators/data/  (multi-indicator bulk — no ID in path)
        if re.search(
            r"/indicators/data/$", path
        ) and not RE_INDICATOR_ID.search(path):
            entry = dict(qs)
            indicators_bulk_data[json.dumps(entry, sort_keys=True)] = entry
            hit = True

        # /api/v1/indicators/<id>/data/  (bulk — not values, not statistic)
        if RE_INDICATOR_ID.search(path) and re.search(
            r"/indicators/\d+/data/$", path
        ):
            m = RE_INDICATOR_ID.search(path)
            entry = {"indicator_id": int(m.group(1)), **qs}
            indicator_data[json.dumps(entry, sort_keys=True)] = entry
            hit = True

        # /api/dashboard/<slug>/indicator-layer/<id>
        m = RE_INDICATOR_LAYER_ID.search(path)
        if m:
            indicator_layer_ids.add(int(m.group(1)))
            hit = True

        # /api/v1/reference-datasets/<uuid>/
        m = RE_REFERENCE_DATASET_UUID.search(path)
        if m:
            reference_dataset_uuids.add(m.group(1).lower())
            hit = True

        # /api/related-table/<id>/  and  /api/related-table/<id>/data
        m = RE_RELATED_TABLE_DETAIL_ID.search(path)
        if m:
            related_table_detail_ids.add(int(m.group(1)))
            hit = True

        # /api/v1/related-tables/<id>/geo-data/dates/
        m = RE_RELATED_TABLE_ID.search(path)
        if m:
            entry = {"id": int(m.group(1)), **qs}
            related_tables[json.dumps(entry, sort_keys=True)] = entry
            hit = True

        if hit:
            matched += 1

    logger.info(
        f"{len(url_entries)} URLs parsed → "
        f"{matched} matched a known GeoSight pattern"
    )

    return {
        "_comment": "Auto-generated by build_params.py — edit freely.",
        "dashboard_slugs": sorted(dashboard_slugs),
        "arcgis_proxy_ids": sorted(arcgis_proxy_ids),
        "arcgis_proxy_urls": sorted(arcgis_proxy_urls),
        "reference_layer_uuids": sorted(reference_layer_uuids),
        "indicator_layer_ids": sorted(indicator_layer_ids),
        "reference_dataset_uuids": sorted(reference_dataset_uuids),
        "related_table_detail_ids": sorted(related_table_detail_ids),
        "indicator_values": {
            "indicator_ids": sorted(iv_indicator_ids),
            "geom_ids": sorted(iv_geom_ids),
            "frequencies": sorted(iv_frequencies),
        },
        "related_tables": list(related_tables.values()),
        "indicator_data": list(indicator_data.values()),
        "indicators_bulk_data": list(indicators_bulk_data.values()),
        "indicator_statistics": list(indicator_statistics.values()),
    }


# ---------------------------------------------------------------------------
# Merging
# ---------------------------------------------------------------------------


def merge(existing: dict, generated: dict) -> dict:
    """
    Union-merge generated params into existing params.json.

    Lists are deduplicated. Dicts are merged recursively.

    :param existing: the existing params.json content as a dict
    :type existing: dict
    :param generated: the newly generated params dict to merge in
    :type generated: dict
    :return: the merged params dict
    :rtype: dict
    """

    def union(a: list, b: list) -> list:
        seen, result = set(), []
        for item in a + b:
            key = (
                json.dumps(item, sort_keys=True)
                if isinstance(item, dict)
                else item
            )
            if key not in seen:
                seen.add(key)
                result.append(item)
        return result

    merged = dict(existing)
    for k, v in generated.items():
        if k == "_comment":
            continue
        if k not in merged:
            merged[k] = v
        elif isinstance(v, list) and isinstance(merged[k], list):
            merged[k] = union(merged[k], v)
        elif isinstance(v, dict) and isinstance(merged[k], dict):
            for sk, sv in v.items():
                if sk not in merged[k]:
                    merged[k][sk] = sv
                elif isinstance(sv, list):
                    merged[k][sk] = union(merged[k][sk], sv)
                else:
                    merged[k][sk] = sv
        else:
            merged[k] = v
    return merged


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def print_summary(params: dict) -> None:
    """Print a summary of the loaded parameters for verification.

    :param params: the params dict to summarize
    :type params: dict
    """
    iv = params.get("indicator_values", {})
    logger.info(
        f"\n  dashboard_slugs      : {params.get('dashboard_slugs')}\n"
        f"  arcgis_proxy_ids     : {params.get('arcgis_proxy_ids')}\n"
        f"  arcgis_proxy_urls    : {params.get('arcgis_proxy_urls')}\n"
        f"  reference_layer_uuids: {params.get('reference_layer_uuids')}\n"
        f"  indicator_layer_ids  : {params.get('indicator_layer_ids')}\n"
        f"  reference_dataset_uuids: {params.get('reference_dataset_uuids')}\n"
        "  related_table_detail_ids: "
        f"{params.get('related_table_detail_ids')}\n"
        f"{params.get('related_table_detail_ids')}\n"
        f"  indicator_values     : ids={iv.get('indicator_ids')} "
        f"geom_ids={iv.get('geom_ids')} frequencies={iv.get('frequencies')}\n"
        "  related_tables       : "
        f"{len(params.get('related_tables', []))} entry/entries\n"
        "  indicator_data       : "
        f"{len(params.get('indicator_data', []))} entry/entries\n"
        "  indicators_bulk_data : "
        f"{len(params.get('indicators_bulk_data', []))} entry/entries\n"
        "  indicator_statistics : "
        f"{len(params.get('indicator_statistics', []))} entry/entries\n"
    )


def main() -> None:
    """Entry point for the build_params script."""
    logging_setup()
    parser = argparse.ArgumentParser(
        description=(
            "Build params.json for locustfile.py from a HAR file or "
            "a plain-text URL list."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "input",
        help="HAR file, plain-text URL file, or '-' for stdin",
    )
    parser.add_argument(
        "--output",
        "-o",
        default="params.json",
        help="Output path (default: params.json)",
    )
    parser.add_argument(
        "--host",
        default=None,
        metavar="HOSTNAME",
        help="Only include HAR entries whose URL host contains HOSTNAME "
        "(e.g. geosight.unicef.org)",
    )
    parser.add_argument(
        "--only-success",
        action="store_true",
        help="Only include HAR entries with a 2xx response status",
    )
    parser.add_argument(
        "--no-merge",
        action="store_true",
        help="Overwrite existing params.json instead of merging into it",
    )
    args = parser.parse_args()

    urls = load_urls(
        args.input, host_filter=args.host, only_success=args.only_success
    )
    if not urls:
        logger.error("no valid URLs found in input.")
        sys.exit(1)

    url_entries = parse_urls(urls)
    generated = build_params(url_entries)

    output_path = Path(args.output)
    # add data directory if not present
    if output_path.parent == Path("."):
        output_path = Path("data") / output_path
    # ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if output_path.exists() and not args.no_merge:
        try:
            existing = json.loads(output_path.read_text(encoding="utf-8"))
            final = merge(existing, generated)
            logger.info(f"Merged into existing {output_path}")
        except json.JSONDecodeError:
            logger.warning(
                f"{output_path} contains invalid JSON — overwriting."
            )
            final = generated
    else:
        final = generated

    output_path.write_text(json.dumps(final, indent=2), encoding="utf-8")
    logger.info(f"Written → {output_path}")
    print_summary(final)


if __name__ == "__main__":
    main()
