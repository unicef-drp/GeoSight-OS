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
context_id: 1234
---

# GeoSight

## QUICK INSTALLATION GUIDE

### Production

```
git clone https://github.com/unicef-drp/GeoSight
cd GeoSight/deployment
docker-compose up -d
```

The web will be available at `http://127.0.0.1/`

To stop containers:

```
docker-compose kill
```

To stop and delete containers:

```
docker-compose down
```

### Development

```
git clone https://github.com/unicef-drp/GeoSight
cd GeoSight/deployment
cp .template.env .env
docker-compose.override.template.yml docker-compose.override.yml

cd GeoSight
make up
make dev
```

The web will be available at `http://localhost:2000/`

To stop dev:

```
make dev-kill
```

To reload container:

```
make dev-reload
```

### Setup onedrive

1. Download onedrive by `sudo apt-get install onedrive`
2. Execute `onedrive --get-O365-drive-id '<your site name to search>'`
3. It will ask to click an url and put back the url that created on browser
4. It will show an information. Check drive_id and copy it.
5. Open file deployment/onedrive/config and put it to drive_id
6. `make onedrive-firstrun` to run first config
7. It will ask to click an url and put back the url that created on browser
8. Wait the system to finish the sync
9. After that we can stop it and do `make up`

More information:
https://github.com/abraunegg/onedrive/blob/master/docs/SharePoint-Shared-Libraries.md