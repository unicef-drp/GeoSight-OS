/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'zakki@kartoza.com'
 * __date__ = '08/01/2025'
 * __copyright__ = ('Copyright 2025, Unicef')
 */

import React, {Fragment, useEffect, useState} from 'react';
import axios from "axios";
import Grid from "@mui/material/Grid";
import ImageIcon from '@mui/icons-material/Image';

import {SearchInput} from "../../components/Input/IconInput";
import {MultipleSelectWithSearch, SelectWithSearch} from "../../components/Input/SelectWithSearch";
import {SortAscIcon, SortDescIcon} from "../../components/Icons";

import './style.scss';


interface ProjectListProps {
  url: string;
  onSetProject: () => void;
}

type Permission = {
  list: boolean;
  read: boolean;
  edit: boolean;
  share: boolean;
  delete: boolean;
}

type GeoSightProject = {
  id: string;               // Unique identifier for the project
  slug: string;             // Slug for the project
  icon: string | null;      // Icon for the project (can be null)
  name: string;             // Name of the project
  created_at: string;       // Creation timestamp
  modified_at: string;      // Modification timestamp
  description: string;      // Description of the project
  group: string;            // Group associated with the project
  category: string;         // Category of the project
  permission: Permission;   // Permissions object
  reference_layer: number;  // ID of the reference layer
  creator: number;          // ID of the creator
}


interface ProjectGridProps {
    projects: GeoSightProject[];
}



/** Project Grid */
function ProjectGrid({ projects }: ProjectGridProps) {
  return <Grid container spacing={2}>
    {
      projects.map((project: GeoSightProject, idx: number) => (
        <Grid key={idx} item xs={3}>
          <div className='ProjectGrid'>
            <a href={'/project/' + project.slug}>
              <div className='ProjectGridIcon'>
                {
                  project.icon ? <img src={project.icon}/> :
                    <ImageIcon/>
                }
              </div>
              <div className='ProjectGridName'>{project.name}</div>
              <div
                className='ProjectGridDescription'
                dangerouslySetInnerHTML={{
                  __html: project.description
                }}/>
              <div className='ProjectGridTags'>
                {project.category ? <div>{project.category}</div> : null}
              </div>
            </a>
          </div>
        </Grid>
      ))
    }
  </Grid>
}

/**
 * ProjectList
 */
export default function ProjectList({ url, onSetProject }: ProjectListProps) {
  const [searchProject, setSearchProject] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSortBy, setSelectedSortBy] = useState<string>('Name');
  const [selectedSortByAsc, setSelectedSortByAsc] = useState<boolean>(true);

  const [projects, setProjects] = useState<GeoSightProject[]>([]);


  // Fetch data
  useEffect(() => {
    axios.get(url).then(response => {
      const categories: string[] = response.data.filter(
          (project: GeoSightProject) => project.category
      ).map((project: GeoSightProject) => project.category)
      setSelectedCategories(Array.from(new Set(categories)))
      setProjects(response.data)
    }).catch(error => {
    })
  }, [])

  // Create category
  let categories: string[] = [];
  if (projects) {
    categories = Array.from(
      new Set(projects.filter(project => project.category).map(project => project.category))
    );
  }

  // We do filter and sort
  let sortedProjects = projects;
  if (sortedProjects) {
    sortedProjects = sortedProjects.filter(project => (selectedCategories.length === categories.length && !project.category) || selectedCategories.includes(project.category))
    sortedProjects.sort((a, b) => {
      let sorted = true
      switch (selectedSortBy) {
        case 'Name':
          sorted = a.name.toLowerCase() < b.name.toLowerCase();
          break
        case 'Date created':
          sorted = a.created_at < b.created_at;
          break
        case 'Date modified':
          sorted = a.modified_at < b.modified_at;
          break
      }
      if (sorted) {
        return selectedSortByAsc ? -1 : 1
      }
      return selectedSortByAsc ? 0 : -1
    });
  }


  // @ts-ignore
  return (
    <Fragment>
      <div className='PageContent-Title'>
        Your projects <div className='Separator'/>
      </div>
      <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <SearchInput
              className='SearchInput'
              placeholder='Search projects' value={searchProject}
              // onChange={setSearchProject}
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                setSearchProject(evt.target.value); // Access the input's value correctly
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <MultipleSelectWithSearch
              value={selectedCategories}
              onChangeFn={(value: string[]) => {
                setSelectedCategories(value)
              }}
              options={categories}
              className='CategorySelector'
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6} xl={6}>
            <SelectWithSearch
                  value={selectedSortBy}
                  onChangeFn={(value: string) => {
                    setSelectedSortBy(value)
                  }}
                  options={['Name', 'Date created', 'Date modified']}
                  className='SortSelector'
                  parentClassName='SortSelectorInput'
                  iconStart={
                    <div
                      onClick={_ => setSelectedSortByAsc(_ => !_)}>
                      {selectedSortByAsc ? <SortAscIcon/> : <SortDescIcon/>}
                    </div>
                  }
                />
          </Grid>
      </Grid>
      <ProjectGrid
        projects={
          projects.filter(
              (project: GeoSightProject) => !searchProject || project.name.includes(searchProject) || project.description?.includes(searchProject)
          )
        }
      />
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    </Fragment>
  )
}
