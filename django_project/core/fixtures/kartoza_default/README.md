# Kartoza Default Fixtures

This directory contains the default data fixtures loaded when
`INITIAL_KARTOZA_DATA=True` is set in the environment.

## Usage

Set the environment variable before starting the application:

```env
INITIAL_KARTOZA_DATA=True
```

During initialization (`initialize.py`), the `load_kartoza_default` management
command will load these fixtures in order.

## Fixtures

| File                         | Description                                                      |
|------------------------------|------------------------------------------------------------------|
| `0.preferences.json`         | Site preferences (title, colors, disclaimer, basemap defaults)   |
| `1.core.json`                | Core data (users, groups)                                        |
| `2.geosight_data.json`       | GeoSight data (indicators, dashboards, basemaps, context layers) |
| `3.geosight_permission.json` | Permission settings for GeoSight resources                       |

## Icons

The `icons/` subdirectory contains basemap thumbnail images copied to
`MEDIA_ROOT/icons/` during fixture loading:

| File                   | Description              |
|------------------------|--------------------------|
| `basemap-osm.png`      | OSM basemap thumbnail    |
| `basemap-opentopo.png` | Open Topo Map thumbnail  |

## Notes

- Fixtures are loaded in numerical order.
- Fields not present in a fixture will use the model's default value.
- This data is intended for Kartoza-specific deployments and is not loaded by
  default.