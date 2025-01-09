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

import React, {Fragment, useEffect, useState, useRef} from 'react';
import axios from "axios";
import Grid from "@mui/material/Grid";
import ImageIcon from '@mui/icons-material/Image';

import {SearchInput} from "../Input/IconInput";
import {MultipleSelectWithSearch, SelectWithSearch} from "../../components/Input/SelectWithSearch";
import {SortAscIcon, SortDescIcon} from "../../components/Icons";

import './style.scss';


interface ProjectListProps {
  url: string;
  setIsLoading: (val: boolean) => void;
}

type Permission = {
  list: boolean;
  read: boolean;
  edit: boolean;
  share: boolean;
  delete: boolean;
}

export interface GeoSightProject {
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
    onScrollY: (e: any) => void;
    containerRef: any;
}


/** Project Grid */
function ProjectGrid({ projects, onScrollY, containerRef }: ProjectGridProps) {
  return <Grid container spacing={2} className='project-grid-container' onScroll={onScrollY} ref={containerRef}>
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
              <div className='ProjectGridName'>{project.name} | {project.created_at} | {project.modified_at}</div>
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
export default function ProjectList({ url, setIsLoading }: ProjectListProps) {
  const [searchProject, setSearchProject] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSortBy, setSelectedSortBy] = useState<string>('Date modified');
  const [selectedSortByAsc, setSelectedSortByAsc] = useState<boolean>(true);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const containerRef = useRef(null);

  // switch (selectedSortBy) {
  //   case 'Date modified':
  //     url = selectedSortByAsc ? `${url}&sort=modified_at` : `${url}&sort=-modified_at`;
  //     break;
  //   case 'Date created':
  //     url = selectedSortByAsc ? `${url}&sort=created_at`: `${url}&sort=-created_at`;
  //     break;
  //   case 'Name':
  //     url = selectedSortByAsc ? `${url}&sort=name`: `${url}&sort=-created_at`;
  //     break
  // }

  const fetchProjects = async (url: string, append: boolean = true, scrollTop: number) => {
    if (!url) return;
    try {
      axios.get(url).then(response => {
        setIsLoading(false)
        const categories: string[] = response.data.results.filter(
            (project: GeoSightProject) => project.category
        ).map((project: GeoSightProject) => project.category)
        setSelectedCategories(Array.from(new Set(categories)))

        if (append) {
          // Append projects for next page
          setProjects((prev) => [...prev, ...response.data.results]);
        }
        else {
          // Prepend projects for previous page
          setProjects((prev) => [...response.data.results, ...prev]);
        }
        console.log(response.data.previous)
        setNextPage(response.data.next);
        setPreviousPage(response.data.previous);
        if (containerRef.current) {
          containerRef.current.scrollTop = scrollTop;
        }
      }).catch(error => {
        console.error("Failed to fetch projects:", error);
      })
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const handleScroll = (e: any) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;

    // Fetch the next page if scrolled to the bottom
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setTimeout(async () => {
        fetchProjects(nextPage, true, 50);
        }, 1000);
    }

    // Fetch the previous page if scrolled to the top
    if (scrollTop <= 10) {
      setTimeout(async () => {
        fetchProjects(previousPage, false, clientHeight);
      }, 1000);
    }
  };

  const txt = url.includes('?creator=!') || url.includes('dashboard/list') ? 'Other shared projects' : 'Your projects'

  const [projects, setProjects] = useState<GeoSightProject[]>([]);


  // Fetch data
  useEffect(() => {
    fetchProjects(url, true, 0)
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
    projects ? <Fragment>
      <div className='PageContent-Title'>
        {txt} <div className='Separator'/>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6} xl={6}>
          <SearchInput
            className='SearchInput'
            placeholder='Search projects' value={searchProject}
            onChange={setSearchProject}
          />
        </Grid>
        <Grid item xs={12} md={3} lg={3} xl={3}>
          <MultipleSelectWithSearch
            value={selectedCategories}
            onChangeFn={(value: string[]) => {
              setSelectedCategories(value)
            }}
            options={categories}
            className='CategorySelector'
          />
        </Grid>
        <Grid item xs={12} md={3} lg={3} xl={3}>
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
          sortedProjects.filter(
              (project: GeoSightProject) => !searchProject || project.name.includes(searchProject) || project.description?.includes(searchProject)
          )
        }
        onScrollY={handleScroll}
        containerRef={containerRef}
      />
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    </Fragment> : null
  )
}
