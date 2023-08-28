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
git clone https://github.com/unicef-drp/GeoSight-OS
cd GeoSight-OS/deployment
cp .template.env .env
cp docker-compose.override.template.yml docker-compose.override.yml
```

After that, do
- open new terminal
- on folder root of project, do
```
make frontend-dev
```
Wait until it is done
when there is sentence "webpack xxx compiled successfully in xxx ms".<br>
After that, don't close the terminal.
If it is accidentally closed, do `make frontend-dev` again

Next step:
- Open new terminal
- Do commands below
```
make up
make dev
```

Wait until it is on.

The web can be accessed using `http://localhost:2000/`

If the web is taking long time to load, restart geosight_dev container by `make dev-reload`.<br>
The sequence should be `make frontend-dev`, after that run or restart geosight_dev. 

To stop dev:

```
make dev-kill
```

To reload container:

```
make dev-reload
```