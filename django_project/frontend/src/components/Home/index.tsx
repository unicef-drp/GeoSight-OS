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
  baseUrl: string;
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
  // let newProjects = [];
  // for (let i = 0; i < 13; i++) {
  //     let baseProject = projects[i % projects.length];
  //     if (baseProject) newProjects.push(baseProject);
  // }
  // projects = newProjects;
  // @ts-ignore
  const userId: number = user.id;
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
              <div className='ProjectGridName'>{project.name}</div>
              <div className='ProjectGridDescription'>
                {
                  userId ? userId == project.creator ? `Modified at: ${project.modified_at}` : null : null
                }
              </div>
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


const generateUrl = (
  baseUrl: string,
  searchProject: string,
  selectedCategories: string[],
  selectedSortBy: string,
  selectedSortByAsc: boolean,
  allcategories: string[]
) => {
  let newUrl = '';
  switch (selectedSortBy) {
    case 'Date modified':
      newUrl = selectedSortByAsc ? `${baseUrl}&sort=modified_at` : `${baseUrl}&sort=-modified_at`;
      break;
    case 'Date created':
      newUrl = selectedSortByAsc ? `${baseUrl}&sort=created_at`: `${baseUrl}&sort=-created_at`;
      break;
    case 'Name':
      newUrl = selectedSortByAsc ? `${baseUrl}&sort=name`: `${baseUrl}&sort=-name`;
      break
  }

  if (selectedCategories.length > 0) {
    const categories = selectedCategories.join(',');
    newUrl = selectedCategories === allcategories ? newUrl : `${newUrl}&group__name__in=${categories}`;
  } else if (selectedCategories.length === 0) {
    newUrl = selectedCategories === allcategories ? newUrl : `${newUrl}&group=0`;
  }

  if (searchProject) {
    newUrl = `${newUrl}&name__icontains=${searchProject}`;
  }
  return newUrl;
}

/**
 * ProjectList
 */
export default function ProjectList({baseUrl, setIsLoading}: ProjectListProps) {
  const [searchProject, setSearchProject] = useState<string>('');
  const [allcategories, setAllcategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSortBy, setSelectedSortBy] = useState<string>('Date modified');
  const [selectedSortByAsc, setSelectedSortByAsc] = useState<boolean>(true);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [projects, setProjects] = useState<GeoSightProject[]>([]);

  const containerRef = useRef(null);

  const fetchProjects = async (url: string, append: boolean = true, scrollTop: number) => {
    if (!url) return;
    try {
      axios.get(url).then(response => {
        setIsLoading(false)

        if (append) {
          // Append projects for next page
          setProjects(response.data.results);
        }
        else {
          // Prepend projects for previous page
          setProjects(response.data.results);
        }
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

  const txt = baseUrl.includes('?creator=!') || !baseUrl.includes('?creator=') ?
    'Other shared projects' : 'Your projects'

  // Fetch data
  useEffect(() => {
    setTimeout(function () {
      const categories = selectedCategories === allcategories && selectedCategories.length === 0 ? [] : selectedCategories;
      const newUrl = generateUrl(baseUrl, searchProject, categories, selectedSortBy, selectedSortByAsc, allcategories);
      fetchProjects(newUrl, true, 0);
    }, 1000);
  }, [searchProject, searchProject, selectedCategories, selectedSortBy, selectedSortByAsc])


    // Fetch data
  useEffect(() => {
    const categoryUrl = baseUrl.replace('&page_size=25', '&page_size=1000').replace('/api/v1/dashboards', '/api/v1/dashboard-groups')
    axios.get(categoryUrl).then(response => {
      setAllcategories(response.data)
      setSelectedCategories(response.data)
    });
  }, [])

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
              value.sort()
              setSelectedCategories(value)
            }}
            options={allcategories}
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
        projects={projects}
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
