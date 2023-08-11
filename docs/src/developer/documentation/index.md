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

# Documentation

## Organisation

The documentation is organised in the following structure:

```
src
├── index.md
├── about
│   ├── index.md
│   ├── code-of-conduct.md
│   ├── contributing.md
│   ├── credits.md
│   ├── disclaimer.md
│   └── license.md
├── administrator
│   ├── index.md
│   ├── guide
│   └── manual
│       ├── data
│       └── index.md
├── developer
│   ├── index.md
│   ├── guide
│   │   ├── api-guide
│   │   └── api-reference
│   ├── documentation
│   ├── guide
│   │   ├── project-prerequisites.md
│   │   ├── building-compiling-code.md
│   │   ├── checking-out-the-code.md
│   │   ├── vscode.md
│   │   ├── pycharm.md
│   │   ├── developer-workflows.md
│   │   ├── running-instances.md
│   │   └── roadmap.md
│   ├── manual
│   │   ├── index.md
│   │   ├── architecture
│   │   └── design
├── devops
│   ├── index.md
│   ├── guide
│   └── manual
└── user
    ├── index.md
    ├── guide
    ├── manual
    └── quickstart
```

## Code Auto Documentation
<!-- mkdocstrings related -->

This process is now automated when `build-docs-html` is run in a local terminal.

## How to Make Documentation
<!-- To Be Populated -->

### Adding to Documentation

To start adding to the documentation navigate to the [home page](https://github.com/unicef-drp/GeoSight-OS) of the repository.

Once on the repository home page, (1) click on Fork
![Fork Repository 1](img/dev-docs-fork-repo-1.png)

On the next page (1) Make sure your github account is selected as the owner and (2) make sure you untick the option to  "**Copy the** `main` **branch only**" as you want to copy all branches.
![Fork Repository 2](img/dev-docs-fork-repo-2.png)

Once you have forked the repository, (1) click on the drop down menu underneath the repository title and then (2) click on the `docs` branch.
![Change Branch](img/dev-docs-change-branch.png)

Once you are in the `docs` branch on your fork of the repository, click on `.` on your keyboard. This will open a web editor where you can begin adding to, or editing, the documentation.
![Web Editor 1](img/dev-docs-web-editor-1.png)

Once the editor loads, you will be greeted by (1) a preview of the project's README.txt. (2) Click on the `docs` directory in the menu on the left, this will expand the directory. To confirm that you are working in the right branch (3) it will say `docs` in the bottom left of the editor.
![Web Editor 2](img/dev-docs-web-editor-2.png)

Once you have expanded the `docs` directory, (1) click on the `src` directory. All sub-directories within the `src` directory contain the files that become the documentation. Each sub-directory contains an `index.md` file that is required for the building of the documentation and static site. If you add a new sub-directory into any folder it must also contain a populated `index.md` file.
![Wed Editor 3](img/dev-docs-web-editor-3.png)

Once you have chosen which section of documentation you would like to edit (e.g. user/guide/index.md), click on the file and it will open in the web editor.
![Web Editor 4](img/dev-docs-web-editor-4.png)

Once you have the file open, you can start adding to the documentation using [Markdown](https://www.markdownguide.org/) syntax. If you need to add images to your documentation, add them to the relative `img` sub-directories following the naming conventions set out in the `naming-convention.README` within the `img` folders.
![Web Editor 5](img/dev-docs-web-editor-5.png)

When you have completed making additions to (or editing) the documentation, (1) click on the source control tab then (2) click on the `plus` symbol next to the changes you are finished with to stage them, (3) add a commit message that is associated with the work you have done, and the (4) Click on `Commit & Push`
![Web Editor 6](img/dev-docs-web-editor-6.png)

Once you have committed your changes, (1) Click on the burger menu and then (2) click on `Go To Repository`
![Web Editor 7](img/dev-docs-web-editor-7.png)

Your fork of the repository will be opened in a new tab within your browser, navigate to that tab. Once there (1) switch to the docs branch, you should see how many commits ahead of the upstream branch you are, then (2) click on `Contribute`-> `Open pull request`.
![Pull Request 1](img/dev-docs-pull-request-1.png)

On the next screen, (1) give your pull request a meaningful title, (2) give additional details regarding changes made in the larger text box, then (3) click on `Create pull request`. Also ensure you are creating a pull request to the upstream `docs` branch from your `docs` branch.
![Pull Request 2](img/dev-docs-pull-request-2.png)

Once your pull request is opened you need to wait for it to be merged before you can open a new one.

### Generating PDFS
<!-- To Be Populated -->

To generate PDFS, `cd` into `GEOSIGHT-OS/docs` and then run the `build-docs-pdf` in a local terminal

### Generating Static Site
<!-- To Be Populated -->

To generate PDFS, `cd` into `GEOSIGHT-OS/docs` and then run the `build-docs-html` in a local terminal.
You can then run `mkdocs serve` to generate the static site on your local host, if there is a port conflict you can specify the port using the `-a` flag e.g `mkdocs serve -a 127.0.0.1:8001`.
