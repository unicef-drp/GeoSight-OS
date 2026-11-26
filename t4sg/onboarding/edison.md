# Onboarding: Edison

## Setup

- **OS:** macOS 15 (Apple Silicon, arm64)
- **Time:** about 45 minutes

| Step | Exact error | Fix |
|---|---|---|
| `make dev` | `stat .../deployment/docker-compose.override.yml: no such file or directory` | Run `make setup` first, then `make dev` |
| `make dev` (build) | `Failed to build 'rasterio'` / `ModuleNotFoundError: No module named 'pkg_resources'` | On arm64, rasterio 1.3.11 is built from source. Pinned `setuptools<81` in `deployment/docker/Dockerfile` |
| `make dev` (start) | `error while creating mount source path '.../volumes/database': ... permission denied` | `sudo chown $USER deployment/volumes deployment/volumes/tmp_data` |
| Redis container | `FATAL CONFIG FILE ERROR ... Can't open the log file: Permission denied` | `rmdir deployment/volumes/tmp_data/redis` (owned by uid 999). Docker recreates it |
| Database container | `data directory "/var/lib/postgresql/13/main" has wrong ownership` | In `docker-compose.override.yml`, use the named volume `database:` instead of `./volumes/database` |
| Login | `admin` / `admin` rejected | Run `initialize.py` in the `dev` container to create the admin user |
| Demo project | No colors, `403` errors in sidebar | Log in. Indicator data needs a logged-in user |

## Glossary

- **Project:** A dashboard: a map plus the indicators and layers chosen to show on it.
- **Indicator:** One measured thing (e.g. a rate or count), with a value per region and date.
- **Reference dataset:** The set of boundaries (country, regions, districts) that values are attached to.
- **Context layer:** An extra map layer for background info (e.g. roads, facilities). It doesn't color regions by indicator value.
- **PCode / geo code:** A unique ID for each region, so data can be matched to the right boundary.

## What I found

- **5.2 (indicators):** Each value has a `geometry_code` (e.g. `SOM_0001_V1`) that says which region it belongs to.
- **5.3 (upload data):** Admin → Importer. The form asks for a reference dataset and admin level, date/time, an indicator (or an indicator column), a **Geo Code Column**, and a **Value Column**.
- **5.4 (reference datasets):** Admin → Reference Datasets (`/admin/reference-datasets/`).

## Question

How do we make sure our uploaded data uses the same geo codes as the reference dataset, especially when a country's boundaries change?
