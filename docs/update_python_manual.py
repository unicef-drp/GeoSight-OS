#! /usr/bin/env python

import os

template = """
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

# Python Reference Manual
"""

ignore_list = [ 
	"__init__",
	"migrations",
    "tests"]

for root, dirs, files in os.walk("../django_project"):
    for file in files:
        file = os.path.join(root, file)
        if file.endswith(".py"):
            ignored = False;
            for item in ignore_list:
                if item in file:
                    ignored = True;
                #print (item, file, ignored)
            if not ignored:
                file = file.replace("../django_project/", "::: ")
                file = file.replace("/", ".")
                file = file.replace(".py", "")
                template = template + file + "\n"
file = open("src/developer/manual/index.md","wt")
file.write(template)
file.close()
