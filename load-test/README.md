# GeoSight Load Testing

Load tests for the GeoSight API, built with [Locust](https://locust.io/).
The workflow is: **record → build params → run**.

---

## Prerequisites

```bash
pip install locust
```

Python 3.10+ is required (uses `str | None` union type syntax).

---

## Workflow Overview

```
Chrome DevTools (HAR)  →  build_params.py  →  data/params.json  →  locust
```

---

## Step 1 — Export a HAR file from Chrome DevTools

1. Open Chrome and navigate to the GeoSight dashboard you want to test.
2. Open DevTools (`F12` or `Cmd+Option+I`).
3. Go to the **Network** tab.
4. Reload the page and interact with the dashboard (open layers, click map features, etc.) to capture all relevant API calls.
5. Right-click any request in the Network panel → **Save all as HAR with content**.
6. Save the file to `load-test/data/` (e.g. `data/recording.har`).

> **Tip:** Interact thoroughly — open dashboards, click through map features, and trigger data drills. The richer the recording, the better the parameter pool.

---

## Step 2 — Build `params.json`

`build_params.py` parses the HAR file, extracts all GeoSight API parameters, and writes them to `data/params.json`. Locust reads this file at startup.

### Basic usage

```bash
# Run from the load-test directory
cd load-test

python build_params.py data/recording.har
```

Output is written to `data/params.json` by default.

### All options

| Flag | Default | Description |
|------|---------|-------------|
| `input` | *(required)* | HAR file, plain-text URL file, or `-` for stdin |
| `--output`, `-o` | `data/params.json` | Output path for the generated params file |
| `--host HOSTNAME` | *(none)* | Only keep HAR entries whose URL host contains `HOSTNAME` — useful when the HAR contains third-party CDN/analytics requests |
| `--only-success` | off | Only include HAR entries that received a 2xx response |
| `--no-merge` | off | Overwrite an existing `params.json` instead of merging into it |

### Examples

```bash
# Filter to only your GeoSight instance
python build_params.py data/recording.har --host geosight.unicef.org

# Only keep successful responses
python build_params.py data/recording.har --only-success

# Save to a custom path
python build_params.py data/recording.har --output data/staging_params.json

# Overwrite instead of merging
python build_params.py data/recording.har --no-merge

# Accumulate from multiple recordings (default merge behaviour)
python build_params.py data/session1.har
python build_params.py data/session2.har   # merged into data/params.json

# Plain-text URL list (one URL per line)
python build_params.py urls.txt

# Read from stdin
cat urls.txt | python build_params.py -
```

### What gets extracted

`build_params.py` recognises the following GeoSight API patterns and ignores everything else:

| Key in `params.json` | API pattern |
|---|---|
| `dashboard_slugs` | `/dashboard/<slug>/` |
| `arcgis_proxy_ids` / `arcgis_proxy_urls` | `/arcgis/<id>/proxy` |
| `reference_layer_uuids` | `reference_layer_uuid` query param |
| `indicator_layer_ids` | `/indicator-layer/<id>` |
| `reference_dataset_uuids` | `/reference-datasets/<uuid>/` |
| `related_table_detail_ids` | `/related-table/<id>/` |
| `indicator_values` | `/indicators/<id>/data/values/` |
| `related_tables` | `/related-tables/<id>/geo-data/dates/` |
| `indicator_data` | `/indicators/<id>/data/` |
| `indicators_bulk_data` | `/indicators/data/` (no ID in path) |
| `indicator_statistics` | `/indicators/<id>/data/statistic/` |

---

## Step 3 — Run Locust

All commands are run from the `load-test/` directory.

### Locustfile overview

Test entry points live under `locustfiles/`.  Pick the right file for your
purpose — each one imports only the shape class(es) it needs, which prevents
Locust from auto-discovering conflicting shapes.

| File | Shape | Purpose |
|------|-------|---------|
| `locustfiles/ui.py` | All shapes | Interactive web UI with `--class-picker` |
| `locustfiles/headless.py` | None | Flat load driven by `-u` / `-r` / `--run-time` |
| `locustfiles/step.py` | `StepLoadShape` | Ramp users up in discrete steps |
| `locustfiles/stress.py` | `StressTestShape` | Ramp up → hold peak → ramp down |
| `locustfiles/spike.py` | `SpikeTestShape` | Baseline → sudden spike → recovery |

Shared setup (user imports and the slow-request hook) lives in
`locustfiles/common.py` and is imported by all entry points.

---

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEOSIGHT_API_KEY` | Yes (unless `IS_PUBLIC_DASHBOARD=true`) | API token sent as `Authorization: Token <key>` |
| `IS_PUBLIC_DASHBOARD` | No | Set to `true` to skip authentication entirely |
| `PARAMS_PATH` | No | Path to `params.json` (default: `data/params.json`) |

```bash
export GEOSIGHT_API_KEY=your_token_here
# or for public dashboards:
export IS_PUBLIC_DASHBOARD=true
```

---

### Option A — Web UI

Starts a local web server at `http://localhost:8089` where you can configure and monitor the test interactively.

```bash
locust -f locustfiles/ui.py --host=https://geosight.unicef.org
```

Open `http://localhost:8089` in your browser, enter the number of users and spawn rate, then click **Start**.

**With class picker** (lets you choose a specific user class and shape in the UI):

```bash
locust -f locustfiles/ui.py --host=https://geosight.unicef.org --class-picker
```

**Custom web UI port:**

```bash
locust -f locustfiles/ui.py --host=https://geosight.unicef.org --web-port 9090
```

---

### Option B — CLI / interactive (no browser required)

Runs with the terminal UI. Useful for quick manual tests.

```bash
locust -f locustfiles/ui.py \
    --host=https://geosight.unicef.org \
    -u 10 -r 2
```

| Flag | Description |
|------|-------------|
| `-u`, `--users` | Peak number of concurrent users |
| `-r`, `--spawn-rate` | Users spawned per second |

---

### Option C — Headless (fully automated / CI)

No UI; runs for a fixed duration and exits with a non-zero code on failure.
Use `locustfiles/headless.py` for flat load — it imports no shape class so
`-u`, `-r`, and `--run-time` are respected directly.

**Full journey** (sequential waterfall, mirrors a real browser session):

```bash
locust -f locustfiles/headless.py \
    --host=https://geosight.unicef.org \
    --headless -u 10 -r 2 --run-time 5m \
    --csv=results \
    FullJourneyUser
```

**Single endpoint** (isolate one API call):

```bash
locust -f locustfiles/headless.py \
    --host=https://geosight.unicef.org \
    --headless -u 20 -r 2 --run-time 2m \
    --csv=results \
    IndicatorValuesUser
```

**Common headless flags:**

| Flag | Description |
|------|-------------|
| `--headless` | Disable the web UI |
| `-u`, `--users` | Peak concurrent users |
| `-r`, `--spawn-rate` | Users per second to spawn |
| `--run-time`, `-t` | Stop after this duration (e.g. `30s`, `5m`, `1h`) |
| `--csv=<prefix>` | Write results to `<prefix>_stats.csv`, `<prefix>_failures.csv`, etc. |
| `--html=report.html` | Write an HTML report |
| `--exit-code-on-error 1` | Exit with code 1 if any requests failed (useful in CI) |

---

### Option D — Load shapes (headless)

Shape files manage user count and test duration via their `tick()` method, so
`-u`, `-r`, and `--run-time` are not needed.

**Step load** (ramp up in discrete steps):

```bash
locust -f locustfiles/step.py \
    --host=https://geosight.unicef.org \
    --headless --csv=results \
    FullJourneyUser
```

**Stress test** (ramp up → hold peak → ramp down):

```bash
locust -f locustfiles/stress.py \
    --host=https://geosight.unicef.org \
    --headless --csv=results \
    FullJourneyUser
```

**Spike test** (baseline → sudden spike → recovery):

```bash
locust -f locustfiles/spike.py \
    --host=https://geosight.unicef.org \
    --headless --csv=results \
    FullJourneyUser
```

To customise a shape's parameters, subclass it and override the class
attributes (see `shapes.py` for the full list of tuneable values).

---

### Option E — Automated scenario runner (`run_scenarios.py`)

`run_scenarios.py` is a higher-level wrapper that runs one or more predefined
scenarios by invoking Locust as a subprocess for each user class in sequence.
It handles output collection, per-class CSV merging, and run logging
automatically — no manual Locust invocations required.

#### Predefined scenarios

| Scenario | Users | Spawn rate | Run time | Classes |
|----------|-------|------------|----------|---------|
| `baseline` | 1 | 1 | 2 min | All single-endpoint classes |
| `baseline-full-journey` | 1 | 1 | 2 min | `FullJourneyUser` |
| `normal-load` | 50 | 5 | 10 min | All single-endpoint classes |
| `normal-load-full-journey` | 50 | 5 | 10 min | `FullJourneyUser` |

#### Usage

```bash
# Run from the load-test directory
cd load-test

# Run all scenarios (default)
python run_scenarios.py --host https://geosight.unicef.org

# Run a single scenario
python run_scenarios.py --host https://geosight.unicef.org --scenario baseline

# Custom output directory
python run_scenarios.py --host https://geosight.unicef.org --output-dir my_results
```

#### All options

| Flag | Default | Description |
|------|---------|-------------|
| `--host` | *(required)* | Target host URL, e.g. `https://geosight.unicef.org` |
| `--scenario` | `all` | Scenario to run: `baseline`, `baseline-full-journey`, `normal-load`, `normal-load-full-journey`, or `all` |
| `--output-dir` | `output/` | Directory where CSV and log files are written |

#### Output files

All files are written to the output directory with a shared timestamp prefix
(`YYYYMMDD_HHMMSS`). After each scenario finishes, per-class files are merged
into one combined file per type:

| File | Description |
|------|-------------|
| `<ts>_<scenario>_stats.csv` | Aggregated request statistics |
| `<ts>_<scenario>_failures.csv` | Failed requests |
| `<ts>_<scenario>_exceptions.csv` | Exceptions raised during the run |
| `<ts>_<scenario>_stats_history.csv` | Per-interval stats history |
| `<ts>_runner.log` | Timestamped log of the entire runner session |

> **Note:** The environment variables `GEOSIGHT_API_KEY` / `IS_PUBLIC_DASHBOARD`
> and `PARAMS_PATH` (see [Environment variables](#environment-variables) above)
> apply to `run_scenarios.py` as well — they are inherited by the Locust
> subprocesses it spawns.

---

## Available user scenarios

### Full journey

| Class | Description |
|-------|-------------|
| `FullJourneyUser` | Replays the complete dashboard request waterfall in sequence (12 steps): dashboard data → bookmarks → indicator metadata → indicator layer → reference dataset → related-table dates → related-table detail/data → indicator data → bulk data → statistics → values |

### Single-endpoint (benchmark one API at a time)

| Class | Endpoint |
|-------|----------|
| `DashboardDataUser` | `GET /api/dashboard/[slug]/data` |
| `DashboardBookmarksUser` | `GET /api/dashboard/[slug]/bookmarks` |
| `IndicatorMetadataUser` | `POST /api/indicator/metadata` |
| `RelatedTableDatesUser` | `GET /api/v1/related-tables/[id]/geo-data/dates/` |
| `IndicatorDataUser` | `GET /api/v1/indicators/[id]/data/` |
| `IndicatorsBulkDataUser` | `GET /api/v1/indicators/data/` |
| `IndicatorStatisticUser` | `GET /api/v1/indicators/[id]/data/statistic/` |
| `IndicatorValuesUser` | `GET /api/v1/indicators/[id]/data/values/` |
| `IndicatorLayerUser` | `GET /api/dashboard/[slug]/indicator-layer/[id]` |
| `ReferenceDatasetsUser` | `GET /api/v1/reference-datasets/[uuid]/` |
| `RelatedTableDetailUser` | `GET /api/related-table/[id]/` |
| `RelatedTableDataUser` | `GET /api/related-table/[id]/data` |

---

## `params.json` reference

The file lives at `data/params.json` (override with `PARAMS_PATH`). It is auto-generated by `build_params.py` but can be edited freely.

```jsonc
{
  "dashboard_slugs": ["my-dashboard"],          // required — at least one slug
  "arcgis_proxy_ids": [1],                      // required
  "arcgis_proxy_urls": ["https://..."],         // required
  "reference_layer_uuids": ["uuid-..."],        // required
  "indicator_values": {
    "indicator_ids": [1, 4, 5],                 // required
    "geom_ids": ["SOM_0007_0001_V1"],           // required
    "frequencies": ["Monthly"]                  // required
  },
  "related_tables": [                           // required — at least one entry
    { "id": 1, "geography_code_field_name": "Ucode", ... }
  ],
  "indicator_data": [...],                      // required
  "indicators_bulk_data": [...],                // required
  "indicator_statistics": [...],                // required
  "indicator_layer_ids": [1],                   // optional
  "reference_dataset_uuids": ["uuid-..."],      // optional
  "related_table_detail_ids": [1]               // optional
}
```

Locust will fail at startup with a clear error if any required key is missing or empty.

---

## Notes

- Requests taking longer than **3 seconds** are logged to stdout with a `[SLOW]` prefix.
- `FullJourneyUser` adds random think-time delays (`0.2–0.6 s` between statistics requests, `0.5–1.5 s` between values drills) to mimic real user behaviour.
- By default `build_params.py` **merges** new recordings into an existing `params.json`, which grows the parameter pool over time. Use `--no-merge` to start fresh.

---

## How to add a new endpoint

Adding support for a new API endpoint involves four files. The example below adds a
hypothetical `GET /api/v1/widgets/<id>/summary/` endpoint.

### 1. `build_params.py` — extract IDs/params from the HAR

Add a compiled regex near the top with the other `RE_*` patterns:

```python
RE_WIDGET_ID = re.compile(r"/widgets/(\d+)/")
```

Inside `build_params()`, add a set to collect values and a matching block inside
the `for path, qs, method, post_data in url_entries:` loop:

```python
# near the top of build_params(), alongside the other sets
widget_ids: set[int] = set()

# inside the loop
m = RE_WIDGET_ID.search(path)
if m:
    widget_ids.add(int(m.group(1)))
    hit = True
```

Add the new key to the returned dict:

```python
return {
    ...
    "widget_ids": sorted(widget_ids),   # ← new
}
```

And add a line to `print_summary()` so it shows up in the build output:

```python
f"  widget_ids           : {params.get('widget_ids')}\n"
```

If the key must always be present, also add it to `_REQUIRED` in `common.py`
(see step 2). If it is optional, use `.get()` with a default of `[]`.

---

### 2. `users/common.py` — expose the pool variable

Load the new key from `_p` (the parsed `params.json`) alongside the existing pools:

```python
# optional pool — use _p.get() so startup doesn't fail if the key is absent
WIDGET_IDS: list[int] = _p.get("widget_ids", [])
```

For a required pool, add the key to `_REQUIRED` and load it directly:

```python
_REQUIRED = [
    ...
    "widget_ids",   # ← new required key
]

WIDGET_IDS: list[int] = _p["widget_ids"]
```

Add it to the startup print so the loaded values are visible:

```python
f"  widget_ids           : {WIDGET_IDS}\n"
```

---

### 3. `users/single_endpoint.py` — add a single-endpoint user class

Import the new pool at the top of the file:

```python
from .common import (
    ...
    WIDGET_IDS,     # ← new
    get,
)
```

Add a new `FastHttpUser` subclass at the bottom of the file:

```python
class WidgetSummaryUser(FastHttpUser):
    """Hits GET /api/v1/widgets/[id]/summary/ exclusively."""

    wait_time = between(1, 4)

    @task
    def load_widget_summary(self):
        if not WIDGET_IDS:
            return
        widget_id = random.choice(WIDGET_IDS)
        get(
            self,
            f"/api/v1/widgets/{widget_id}/summary/",
            name="/api/v1/widgets/[id]/summary/",
        )
```

---

### 4. `users/full_journey.py` — add a step to the sequential waterfall

Import the new pool:

```python
from .common import (
    ...
    WIDGET_IDS,     # ← new
    get,
)
```

Pick a value in `on_start()` so all steps for one user use a consistent ID:

```python
def on_start(self):
    ...
    self.widget_id = random.choice(WIDGET_IDS) if WIDGET_IDS else None
```

Add a numbered `@task` method after the existing steps:

```python
@task
def step_13_widget_summary(self):
    if self.widget_id is None:
        return
    get(
        self,
        f"/api/v1/widgets/{self.widget_id}/summary/",
        name="/api/v1/widgets/[id]/summary/",
    )
```

---

### 5. `users/__init__.py` — export the new class

```python
from .single_endpoint import (
    ...
    WidgetSummaryUser,   # ← new
)

__all__ = [
    ...
    "WidgetSummaryUser",   # ← new
]
```

`locustfiles/common.py` re-exports everything from `users`, so no changes are needed there.

---

### Checklist

- [ ] Regex + extraction added in `build_params.py`
- [ ] New key appears in the `build_params()` return dict and `print_summary()`
- [ ] Pool variable added in `users/common.py` (and in `_REQUIRED` if mandatory)
- [ ] `WidgetSummaryUser` added in `users/single_endpoint.py`
- [ ] Step added to `FullJourneyTaskSet` in `users/full_journey.py`
- [ ] Class exported from `users/__init__.py`
- [ ] Re-run `build_params.py` to populate the new key in `data/params.json`
