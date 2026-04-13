# Demo Fixtures

This directory contains demo data fixtures loaded via the `load_demo_data`
management command.

## Usage

```bash
python manage.py load_demo_data
```

## Fixtures

| File                                 | Description                                                      |
|--------------------------------------|------------------------------------------------------------------|
| `1.core.json`                        | Core data (users, groups)                                        |
| `2.preferences.json`                 | Site preferences                                                 |
| `2.preferences_default_dataset.json` | Site preferences with default dataset                            |
| `2.user_group.json`                  | User group assignments                                           |
| `3.geosight_georepo.json`            | GeoRepo reference layers                                         |
| `3.geosight_georepo_levels.json`     | GeoRepo reference layer levels                                   |
| `4.geosight_data.json`               | GeoSight data (indicators, dashboards, basemaps, context layers) |
| `5.geosight_permission.json`         | Permission settings for GeoSight resources                       |

## Cloud Native GIS

The `cloud_native_gis/` subdirectory contains additional fixtures loaded when
`CLOUD_NATIVE_GIS_ENABLED=True`:

| File                           | Description                                       |
|--------------------------------|---------------------------------------------------|
| `cloud_native_gis/1.init.json` | Initial Cloud Native GIS layer setup              |
| `cloud_native_gis/shapefile/`  | Somalia shapefile used to populate the demo layer |

## Notes

- Fixtures are loaded in numerical order.
- Cloud Native GIS fixtures are only loaded when the plugin is enabled.
- This data is intended for demonstration purposes only and should not be used
  in production.