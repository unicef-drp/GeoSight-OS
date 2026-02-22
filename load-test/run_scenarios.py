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
import csv
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
import time

"""
Locust headless runner script.

Runs one or more test scenarios by invoking Locust as a subprocess.

Scenarios
---------
Baseline
    1 user, spawn-rate 1, 2-minute run — one run per single-endpoint class.
Baseline full journey
    1 user, spawn-rate 1, 2-minute run — one run for the full-journey class.
Normal load
    50 users, spawn-rate 5, 10-minute run — one run per single-endpoint class.
Normal load full journey
    50 users, spawn-rate 5, 10-minute run — one run for the full-journey class.

Usage
-----
    # Run all scenarios (default)
    python run_scenarios.py --host https://geosight.unicef.org

    # Run only the baseline scenario
    python run_scenarios.py --host https://geosight.unicef.org
        --scenario baseline

    # Override output directory
    python run_scenarios.py --host https://geosight.unicef.org
        --output-dir my_results
"""


# ---------------------------------------------------------------------------
# Logger — tees timestamped output to stdout and a log file
# ---------------------------------------------------------------------------


class Logger:
    """Write timestamped messages to both stdout and a log file.

    :param log_path: Path to the log file that will be created/appended.
    :type log_path: Path
    """

    def __init__(self, log_path: Path) -> None:
        """Initialize the logger by opening the log file for appending."""
        self._log_path = log_path
        self._fh = log_path.open("a", encoding="utf-8")

    def log(self, message: str = "") -> None:
        """Print *message* with a datetime prefix and mirror it to the file.

        :param message: Text to output. Empty string prints a blank line.
        :type message: str
        """
        prefix = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        for line in message.splitlines() or [""]:
            formatted = f"[{prefix}] {line}" if line else ""
            print(formatted)
            self._fh.write(formatted + "\n")
        self._fh.flush()

    def close(self) -> None:
        """Flush and close the underlying log file handle."""
        self._fh.close()


# ---------------------------------------------------------------------------
# Single-endpoint user classes included in the baseline scenario
# ---------------------------------------------------------------------------


SINGLE_ENDPOINT_CLASSES = [
    "DashboardDataUser",
    "DashboardBookmarksUser",
    "IndicatorMetadataUser",
    "RelatedTableDatesUser",
    "IndicatorDataUser",
    "IndicatorsBulkDataUser",
    "IndicatorStatisticUser",
    "IndicatorValuesUser",
    "IndicatorLayerUser",
    "ReferenceDatasetsUser",
]

FULL_JOURNEY_CLASSES = [
    "FullJourneyUser"
]

# ---------------------------------------------------------------------------
# Scenario definitions
# ---------------------------------------------------------------------------

SCENARIOS = {
    "baseline": {
        "description": (
            "Baseline — 1 user, spawn-rate 1, 2-minute run per endpoint"
        ),
        "users": 1,
        "spawn_rate": 1,
        "run_time": "2m",
        # headless.py imports no LoadTestShape; -u/-r/--run-time are respected.
        # For shape-based scenarios use the matching file in locustfiles/.
        "locustfile": "locustfiles/headless.py",
        "classes": SINGLE_ENDPOINT_CLASSES,
    },
    "baseline-full-journey": {
        "description": (
            "Baseline full journey — 1 user, spawn-rate 1, "
            "2-minute run per endpoint"
        ),
        "users": 1,
        "spawn_rate": 1,
        "run_time": "2m",
        "locustfile": "locustfiles/headless.py",
        "classes": FULL_JOURNEY_CLASSES,
    },
    "normal-load": {
        "description": (
            "Normal load — 50 users, spawn-rate 5, 10-minute run per endpoint"
        ),
        "users": 50,
        "spawn_rate": 5,
        "run_time": "10m",
        "locustfile": "locustfiles/headless.py",
        "classes": SINGLE_ENDPOINT_CLASSES,
    },
    "normal-load-full-journey": {
        "description": (
            "Normal load full journey — 50 users, spawn-rate 5, "
            "10-minute run per endpoint"
        ),
        "users": 50,
        "spawn_rate": 5,
        "run_time": "10m",
        "locustfile": "locustfiles/headless.py",
        "classes": FULL_JOURNEY_CLASSES,
    },
}


# ---------------------------------------------------------------------------
# Runner helpers
# ---------------------------------------------------------------------------


def build_locust_cmd(
    host: str,
    user_class: str,
    users: int,
    spawn_rate: int,
    run_time: str,
    csv_prefix: str,
    json_file: str,
    locustfile: str = "locustfile.py",
) -> list[str]:
    """Build the locust CLI command list for a single run.

    Locust auto-discovers any ``LoadTestShape`` subclass present in the
    locustfile.  To use a custom shape, point *locustfile* at a dedicated
    file that imports only the desired shape class alongside the user classes.

    :param host: Target host URL.
    :type host: str
    :param user_class: Locust user class name to run.
    :type user_class: str
    :param users: Number of concurrent users.
    :type users: int
    :param spawn_rate: Users spawned per second.
    :type spawn_rate: int
    :param run_time: Test duration string (e.g. ``'2m'``).
    :type run_time: str
    :param csv_prefix: Path prefix passed to ``--csv``.
    :type csv_prefix: str
    :param json_file: (Deprecated) File path passed to ``--json-file``.
    :type json_file: str
    :param locustfile: Locust entry-point file (default ``locustfile.py``).
        Use a scenario-specific file when a LoadTestShape is required.
    :type locustfile: str
    :return: Command as a list of strings suitable for :func:`subprocess.run`.
    :rtype: list[str]
    """
    return [
        sys.executable, "-m", "locust",
        "-f", locustfile,
        "--host", host,
        "--headless",
        "-u", str(users),
        "-r", str(spawn_rate),
        "--run-time", run_time,
        "--csv", csv_prefix,
        "--csv-full-history",
        user_class,
    ]


def combine_outputs(
    output_dir: Path,
    timestamp: str,
    scenario_name: str,
    classes: list[str],
    logger: Logger,
) -> None:
    """Merge per-class CSV and JSON files into one combined file per type.

    For each of the three CSV suffixes (``_stats``, ``_failures``,
    ``_exceptions``) all per-class files are concatenated, keeping the header
    from the first file found.  The JSON files (each a list of dicts) are
    merged into a single flat list.

    :param output_dir: Directory containing the per-class output files.
    :type output_dir: Path
    :param timestamp: Timestamp prefix shared by all files in this run.
    :type timestamp: str
    :param scenario_name: Scenario key used in file names.
    :type scenario_name: str
    :param classes: Ordered list of user-class names that were run.
    :type classes: list[str]
    :param logger: Logger instance for timestamped output.
    :type logger: Logger
    """
    prefix = f"{timestamp}_{scenario_name}"

    # --- CSV ---
    for suffix in ("_stats", "_failures", "_exceptions", "_stats_history"):
        out_path = output_dir / f"{prefix}{suffix}.csv"
        header_written = False
        rows_written = 0
        with out_path.open("w", newline="", encoding="utf-8") as out_fh:
            writer = csv.writer(out_fh)
            for cls in classes:
                src = output_dir / f"{prefix}_{cls}{suffix}.csv"
                if not src.exists():
                    logger.log(f"  [SKIP] {src.name} not found, skipping.")
                    continue
                with src.open(newline="", encoding="utf-8") as in_fh:
                    reader = csv.reader(in_fh)
                    for i, row in enumerate(reader):
                        if i == 0:
                            if not header_written:
                                writer.writerow(row)
                                header_written = True
                        else:
                            writer.writerow(row)
                            rows_written += 1
                src.unlink()
        logger.log(
            f"  [CSV] Combined {suffix[1:]} → {out_path.name} "
            f"({rows_written} data rows)"
        )

    # --- JSON ---
    combined: list[dict] = []
    for cls in classes:
        src = output_dir / f"{prefix}_{cls}.json"
        if not src.exists():
            logger.log(f"  [SKIP] {src.name} not found, skipping.")
            continue
        with src.open(encoding="utf-8") as fh:
            data = json.load(fh)
        src.unlink()
        if isinstance(data, list):
            combined.extend(data)
        else:
            combined.append(data)
    if combined:
        out_path = output_dir / f"{prefix}.json"
        with out_path.open("w", encoding="utf-8") as fh:
            json.dump(combined, fh, indent=2)
        logger.log(
            f"  [JSON] Combined → {out_path.name} ({len(combined)} entries)"
        )


def run_scenario(
    scenario_name: str,
    scenario: dict,
    host: str,
    output_dir: Path,
    timestamp: str,
    logger: Logger,
) -> None:
    """Execute all class runs for a single scenario.

    :param scenario_name: Human-readable scenario key (e.g. ``'baseline'``).
    :type scenario_name: str
    :param scenario: Scenario configuration dict.
    :type scenario: dict
    :param host: Target host URL.
    :type host: str
    :param output_dir: Directory where CSV files will be written.
    :type output_dir: Path
    :param timestamp: ISO-style timestamp string used to namespace
        output files.
    :type timestamp: str
    :param logger: Logger instance for timestamped output.
    :type logger: Logger
    """
    logger.log()
    logger.log("=" * 60)
    logger.log(f"Scenario : {scenario_name}")
    logger.log(f"Desc     : {scenario['description']}")
    logger.log(f"File     : {scenario.get('locustfile', 'locustfile.py')}")
    logger.log(
        f"Users    : {scenario['users']}  Spawn-rate: {scenario['spawn_rate']}"
    )
    logger.log(f"Run-time : {scenario['run_time']}")
    logger.log("=" * 60)

    classes = scenario["classes"]
    total = len(classes)
    scenario_start = time.monotonic()

    for idx, user_class in enumerate(classes, start=1):
        file_prefix = str(
            output_dir / f"{timestamp}_{scenario_name}_{user_class}"
        )
        csv_prefix = file_prefix
        json_file = f"{file_prefix}.json"
        cmd = build_locust_cmd(
            host=host,
            user_class=user_class,
            users=scenario["users"],
            spawn_rate=scenario["spawn_rate"],
            run_time=scenario["run_time"],
            csv_prefix=csv_prefix,
            json_file=json_file,
            locustfile=scenario.get("locustfile", "locustfile.py"),
        )

        logger.log()
        logger.log(f"[{idx}/{total}] Running {user_class} …")
        logger.log(f"  cmd: {' '.join(cmd)}")

        class_start = time.monotonic()
        result = subprocess.run(cmd, cwd=Path(__file__).parent)
        class_elapsed = time.monotonic() - class_start
        duration_str = f"{class_elapsed:.1f}s"

        if result.returncode != 0:
            logger.log(
                f"  [WARN] {user_class} exited with code {result.returncode} "
                f"after {duration_str}. Continuing with next class."
            )
        else:
            logger.log(
                f"  [OK]  {user_class} finished in {duration_str}. "
                f"CSV prefix: {csv_prefix} | JSON: {json_file}"
            )
        time.sleep(2)  # brief pause between runs

    scenario_elapsed = time.monotonic() - scenario_start
    logger.log()
    logger.log(
        f"Scenario '{scenario_name}' completed in "
        f"{scenario_elapsed:.1f}s across {total} class(es)."
    )

    logger.log(f"Combining outputs for scenario '{scenario_name}' …")
    combine_outputs(
        output_dir=output_dir,
        timestamp=timestamp,
        scenario_name=scenario_name,
        classes=classes,
        logger=logger,
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> None:
    """Entry point for the runner script."""
    parser = argparse.ArgumentParser(
        description="Run GeoSight Locust scenarios headlessly."
    )
    parser.add_argument(
        "--host",
        required=True,
        help="Target host URL, e.g. https://geosight.unicef.org",
    )
    parser.add_argument(
        "--scenario",
        choices=list(SCENARIOS.keys()) + ["all"],
        default="all",
        help="Scenario to run (default: all).",
    )
    parser.add_argument(
        "--output-dir",
        default="output",
        help="Directory for CSV output files (default: output/).",
    )
    args = parser.parse_args()

    output_dir = Path(__file__).parent / args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = output_dir / f"{timestamp}_runner.log"
    logger = Logger(log_path)
    logger.log(f"Log file : {log_path}")
    logger.log(f"Host     : {args.host}")

    scenarios_to_run = (
        SCENARIOS
        if args.scenario == "all"
        else {args.scenario: SCENARIOS[args.scenario]}
    )

    for name, cfg in scenarios_to_run.items():
        run_scenario(
            scenario_name=name,
            scenario=cfg,
            host=args.host,
            output_dir=output_dir,
            timestamp=timestamp,
            logger=logger,
        )

    logger.log()
    logger.log(f"All done. CSV files written to: {output_dir}")
    logger.close()


if __name__ == "__main__":
    main()
