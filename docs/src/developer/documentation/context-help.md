---
title: GeoSight-OS Documentation Context Help
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

# Context Help

This section describes how the context help system works.

## Overview

The context help system provides an integration between the web application and the documentation.

![](img/context-help-1.png)

The following concepts are used:

- **Site:** This is the area for globally setting options relating to the context help system.
- **Blocks:** These are small components displayed as blocks 1️⃣ in the context help panel. Each block links to a section in the help documentation. ![](img/context-help-2.png)
- **Pages:** These are context help panels that are each linked to a particular URL in the application. ![](img/context-help-3.png)
- **Page Blocks:** These are links between pages and their constituent blocks. Each page can have many blocks and each block can be used in many pages.

## Triggering context help

There are three ways to trigger context help:

1. From the top nav bar 1️⃣ ![image.png](img/context-help-4.png)
2. From the side panel 1️⃣ ![image.png](img/context-help-5.png)
3. Next to widgets (not implemented yet)

## Managing context help

We manage the context help system from django admin. You need to be a staff user to do this and have been granted read/write/update permissions on the documentation center related tables. First open your user menu 1️⃣ and then the Django Admin area 2️⃣.

![image.png](img/context-help-6.png)

Next we can drill into the documentation center to see only the relevant admin activities 1️⃣.

![image.png](img/context-help-7.png)

## Site preferences

Our first activity is to edit the site preferences 1️⃣.

![image.png](img/context-help-8.png)

Here our goal is to set the documentation base url for the context help system 1️⃣. Use the URL for your documentation project i.e. https://unicef-drp.github.io/GeoSight-OS

![image.png](img/context-help-9.png)

## Managing Pages

Next we need to create pages for each application end point where we want to include context sensitive help. First select pages 1️⃣ from the documentation center menu:

![image.png](img/context-help-10.png)

Now you can edit an existing page 1️⃣ or add a new one 2️⃣:

![image.png](img/context-help-11.png)

The page properties you can set are going to determine how the context help panel appears in the application when triggering the help panel 1️⃣:

![image.png](img/context-help-13.png)

Here is a detailed breakdown of the options:

1️⃣ **Name:** A symbolic name for you to easily recognise what the context help is about

2️⃣ **Relative page url:** This is the relative path to our application page (see underline in image above) e.g. /admin/importer/

3️⃣ **Url:** This is where the documentation is, relative to the documentation base URL. For example if your docs base URL is at: https://unicef-drp.github.io/GeoSight-OS/ your help context document relative URL is /administrator/guide/. This will trigger the content panel link 3️⃣ above to point to this page.

4️⃣ **Title:** This will be displayed as 1️⃣ above in the context help panel.

5️⃣ **Intro:** This will be shown as lead-in text for the context help panel. See 2️⃣ above.

![image.png](img/context-help-12.png)

On the page form you can also manage the blocks that appear in the context help.

## Managing blocks

You can view and manage existing blocks from the documentation center 1️⃣ or add a new block 2️⃣. We first create a block then go back to the page to add it to the page.

![image.png](img/context-help-14.png)

We can also create a new block directly from within a page.

- To set a block link within the page use 1️⃣
- To set the order in which the block appears in the help panel use 2️⃣. For ordering, lower number blocks will be listed before higher number blocks. It is up to you to ensure that each number used for ordering is unique.
- To create a new block component for a page, use 3️⃣ and then go and choose or create the actual block content.

![image.png](img/context-help-15.png)

Let's create a new block within the context of an existing page (this is the more normal workflow).

![image.png](img/context-help-16.png)

Because we have created it within the page form, the block form appears as a popup window. We can deal with the form components as follows:

- **The relative url** 1️⃣ (based on the the documentation site wide base url preference) to the documentation page
- **The anchor** 2️⃣ - this is optional and should point to a heading / subheading within the page if populated.
- **The title 3️⃣** - title for the block. This is automatically filled in from the page unless you specify an override title. Normally you would leave this blank.
- **The thumbnail 4️⃣** for the block. This is automatically linked to the first image below the anchor in the help document. Usually you would leave this blank.
- **Description 5️⃣** for the block. This will be automatically populated from the first paragraph in the linked help documentation.

⚠️ As you can see, the block definition requires only minimal information - the URL and optionally the anchor on the page. Anything else you specify here will override information harvested from the page and likely make your documentation more difficult to maintain.

![image.png](img/context-help-17.png)

## Page Blocks

Generally we will not directly use the PageBlocks management area - use the Page manager to add and remove blocks from your page.

## Conclusion and notes

The system for context help has been designed in a generic way. That means that you can use any web site where you can reference content with page links and anchors.

⛔️ One word of caution. Do not use a web site as your documentation source if you do not control that site. The content from the help site is pulled directly into your application, which could put you in a compromising position if the content is not 'on message' for your organisation.




