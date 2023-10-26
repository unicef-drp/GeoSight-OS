---
title: GeoSight-OS Documentation Home 
summary: GeoSight is UNICEF's geospatial web-based business intelligence platform.
    - Tim Sutton
    - Irwan Fathurrahman
date: 2023-08-03
some_url: https://github.com/unicef-drp/GeoSight-OS
copyright: Copyright 2023, Unicef
contact: geosight-no-reply@unicef.org
license: This program is free software; you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
#context_id: 1234
---

# Quickstart
This section describes the key steps for preparing a GeoSight dashboard.

![Quick Steps](../../img/geosight-quick-start-main-steps.png)
1. Find existing or create a new reference boundary dataset in GeoRepo (e.g. world country boundaries or subnational boundaries for your country / region of interest)
2. Find existing or create new Indicator(s) -> e.g. Number of armed conflict events, level of malnutrition, number of children etc
3. Import data for Indicator(s) -> e.g. import one-time from Excel file, or add scheduled data harvesters (from SharePoint or API)
4. Find existing or add new Context Layer(s) -> e.g. Armed conflict events, location of schools / hospitals / UNICEF offices, areas of control etc
5. Create a new Project -> Add Indicators -> Create Indicator Layers -> Add Context Layers -> Define Filters -> Define Widgets -> Share your Project


## How to prepare data for GeoSight?
In GeoSight users can import data from multiple sources:
- APIs (JSON)
- Excel files
- SharePoint Excel
- SDMX Data Warehouse (coming soon)

The easiest way is to import data using standalone Excel file.Excel import supports two formats: 
- LONG and 
- WIDE

![Excel Long and Wide formats](../../img/geosight-excel-long-and-wide-formats.png)

### Excel LONG format
- Can be used to import multiple indicators, geographies (e.g. districts) and dates in one go
- Required columns:
    - GeographyCode – contains unique code for identifying a geographic entity (e.g. district). NOTE: currently geographic entities must be from a single admin level
    - IndicatorCode – should match the Indicator’s shortcode as defined in GeoSight
    - DateTime – valid date, e.g. 01-01-2022
    - Value – observation value

### Excel WIDE format
- Can be used to import multiple indicators, geographies (e.g. districts) for a single date only
- Required columns:
    - GeographyCode – Contains unique code for identifying a geographic entity (e.g. district). NOTE: currently geographic entities must be from a single admin level
    - Indicator columns – name of each column should match the Indicator’s shortcode as defined in GeoSight
    - Value – observation value

