# Grace - Setup + Response (Week 2)

## Setup
* OS: Windows 11
* Setup Duration: ~30 min 
* Errors: 
  * Step #4: make dev error `Killing in production mode... stat /home/hamst/projects/t4sg-unicef-h3/deployment/docker-compose.override.yml: no such file or directory. make: *** [Makefile:35: kill] Error 1`. Fix: `bash setup.sh`, then `make dev` again
  * Step #4: another make dev error `target worker: failed to solve: image "docker.io/unicef/geosight:3.8.0": already exists. make: *** [Makefile:140: dev] Error 1` Fix: Killed the process, then tried `make dev` again

## Glossary 
* Project: The “view” of set(s) of indicator data, where the user can choose the specific location/region of the world to focus on (i.e. Africa), the basemap design, the indicators to show, layers, widgets (i.e. graphs, totals on the sidebar)
* Indicator: What we are measuring, these act as the “columns” on a dataset. We can color code these, customize how we aggregate the data (i.e. avg, sum) across a region of multiple data points
* Reference dataset: The geography dataset that tells the map where the borders of regions are located (i.e. for Kenya - where the admin/district boundaries are)
* Context layer: Additional “layers” of data to show on top of the indicator visuals (this can be color coded dots showing things like locations of specific hospitals, etc), can be enabled/disabled by user when viewing a project
* PCode/geo code: The id # version of the specific area inside a country/region (so there are multiple geo codes for Kenya), that we can assign an indicator value to (so only 1 indicator value per geo code)

## What I Found
* On GeoSight dashboard: indicators get location codes via “Geo Code”: KEN_0001_V1, KEN_0002_V1, … for Kenya
* How to import: we can upload/link to file. Must tell it the Geo Code Column, Value Column, Reference Layer, Type of Geo Code
* Reference Data Sets: We must enter name, level, Geo Code

## Video Comments
Done!!

## Question
After watching the videos, I feel like I know what each piece (Celery, Django, ...) does, but how do all the pieces fit together and which pieces are the "meat"/what we want to focus on versus the "background noise"/just the barebones elements that are not necessarily unique to our H3 project's aims?

