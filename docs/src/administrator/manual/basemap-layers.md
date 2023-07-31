[//]: # "GeoSight is UNICEF's geospatial web-based business intelligence platform."
[//]: # 
[//]: # "Contact : geosight-no-reply@unicef.org"
[//]: # 
[//]: # ".. note:: This program is free software; you can redistribute it and/or modify"
[//]: # "    it under the terms of the GNU Affero General Public License as published by"
[//]: # "    the Free Software Foundation; either version 3 of the License, or"
[//]: # "    (at your option) any later version."
[//]: # 
[//]: # "__author__ = 'irwan@kartoza.com'"
[//]: # "__date__ = '13/06/2023'"
[//]: # "__copyright__ = ('Copyright 2023, Unicef')"
[//]: # "__copyright__ = ('Copyright 2023, Unicef')"

# Basemaps
<b>Basemaps</b> are ready-to-use maps that provide the foundation of the geographic visualization on GeoSight. These maps can come from a variety of different sources and are usually available at different scales, from a single region to the entire globe. Their main purpose is to provide the user with some base information about the area they are focusing on - e.g., terrain, main roads and railways, or satellite views -, so to allow for a better understanding of the context layers available on the platform.

## Basemaps for administrators
Administrators are able to adjust and delete existing basemaps and add new ones. This allows them to control the availability of basemaps.
### Accessing and adjusting basemaps
As with other administrative abilities, the Basemaps UI can be accessed from the GeoSight home page. To access the administative UI, click the user profile photo and select "Admin".

![Select admin](img/Admin.jpeg)

From here, select "Basemaps"

![Select basemap](img/capture-basemap.jpeg)

This will display the Admin UI for basemaps and allow you to see, as well as search for, all basemaps. In this tab, the basemaps are listed and sorted by their name, a brief description and a category to help administators understand their purpose.


### Adding basemaps

Basemaps can be added from the Basemaps Admin tab. On the top right you can find the button "Add Basemap".

![Add or delete basemap](img/add-delete-basemap.jpeg)

This will bring you to the "Create Basemap Screen". Here, administrators can provide information required to connect the basemap to GeoSight, describe the basemap and attach security requirements for sensitive information.

Under name enter what you would like the user to call the basemap.

![Select name of basemap](img/name-basemap.jpeg)

Although this is optional, you can provide a brief description of the context layer including identifying information or a citation. You can also select an icon of your choice as thumbnail.

Under 'URL", you will have to enter the originally URL of the basemap sourced from the website that hosts it.

Under "Type" you will indicate the type of basemap service, which can be WMS or WMTS (Tiled webmap). The type of service will be already known from the website the basemap is sourced from. WMS has the advantage of providing arbitrary and flexible boundaries, while WMTS has faster processing times.

Finally, under "Category" you will indicate the category the basemap belongs to (e.g. UN). 

![Select URL, type and category of basemap](img/type-basemap.jpeg)

Once all required boxes are complete and you have filled out the optional boxes of your choice click submit in the top right corner. In doing this, the basemap will be loaded to the visualization.

### Basemaps for Users
Users cannot adjust or add new basemaps. Instead, they can only toggle between them.

To access basemaps as a user from the GeoSight home page, choose a project and then hover with the mouse the little squared box to the bottom left of the map. This wil allow you to see every available basemap.

To change the basemap, click on one of the boxes from the list. The basemap will update automatically.

Finally, to hide the basemap's list, simply move the mouse away from the boxes. The list will collapse and disappear. Hover on it with the mouse to access it again.

Different basemaps can provide the users with varied broad overviews on the regions they are looking at and put the other layers in several contexts. They can help change perspective and/or offer a more complete picture to allow for better final decisions.
