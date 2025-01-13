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

import React, {Fragment, useEffect, useState, useRef, useMemo} from 'react';
import axios from "axios";
import Grid from "@mui/material/Grid";
import Pagination from '@mui/material/Pagination';
import ImageIcon from '@mui/icons-material/Image';
import Box from "@mui/material/Box";

import {SearchInput} from "../Input/IconInput";
import {MultipleSelectWithSearch, SelectWithSearch} from "../../components/Input/SelectWithSearch";
import {SortAscIcon, SortDescIcon} from "../../components/Icons";
import {GeoSightProject} from '../../types';

import './style.scss';
import {debounce} from "@mui/material/utils";
import CircularProgress from "@mui/material/CircularProgress";


interface ProjectListProps {
  baseUrl: string;
  setParentLoading: (val: boolean) => void;
}

interface ProjectGridProps {
    projects: GeoSightProject[];
}


/** Project Grid */
function ProjectGrid({ projects }: ProjectGridProps) {
  // @ts-ignore
  const userId: number = user.id;
  return <Grid container spacing={2} className='project-grid-container'>
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
  allcategories: string[],
  currentPage: number
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

  newUrl = newUrl.replace(/page=\d+/, `page=${currentPage}`);
  return newUrl;
}

/**
 * ProjectList
 */
export default function ProjectList({baseUrl, setParentLoading}: ProjectListProps) {
  // TODO: combine all filters into 1 veriable
  const [searchProject, setSearchProject] = useState<string>('');
  const [typedProject, setTypedProject] = useState<string>('');
  const [allcategories, setAllcategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSortBy, setSelectedSortBy] = useState<string>('Date modified');
  const [selectedSortByAsc, setSelectedSortByAsc] = useState<boolean>(true);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [projects, setProjects] = useState<GeoSightProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>()

    /** searchProject changed, debouce **/
  const searchProjectUpdate = useMemo(
    () =>
      debounce(
        (newValue) => {
          setSearchProject(newValue)
        },
        400
      ),
    []
  );

  /** Searched project changed **/
  useEffect(() => {
    searchProjectUpdate(typedProject)
  }, [typedProject]);

  const fetchProjects = async (url: string, append: boolean = true, scrollTop: number) => {
    if (!url) return;
    try {
      setIsLoading(true);
      axios.get(url).then(response => {
        setParentLoading(false)
        setIsLoading(false);

        if (append) {
          // Append projects for next page
          setProjects(response.data.results);
        }
        else {
          // Prepend projects for previous page
          setProjects(response.data.results);
        }
        setTotalPage(response.data.total_page);
        setCurrentPage(response.data.page);
      }).catch(error => {
        console.error("Failed to fetch projects:", error);
      })
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const txt = baseUrl.includes('?creator=!') || !baseUrl.includes('?creator=') ?
    'Other shared projects' : 'Your projects'

  // Fetch data
  useEffect(() => {
    const categories = selectedCategories === allcategories && selectedCategories.length === 0 ? [] : selectedCategories;
    const newUrl = generateUrl(baseUrl, searchProject, categories, selectedSortBy, selectedSortByAsc, allcategories, currentPage);
    fetchProjects(newUrl, true, 0);
  }, [searchProject, searchProject, selectedCategories, selectedSortBy, selectedSortByAsc, currentPage])


    // Fetch data
  useEffect(() => {
    const categoryUrl = baseUrl.replace('&page_size=25', '&page_size=1000').replace('/api/v1/dashboards', '/api/v1/dashboards/groups')
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
            placeholder='Search projects' value={typedProject}
            onChange={setTypedProject}
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
      {isLoading ? <div className='LoadingElement'>
        <div className='Throbber'>
          <CircularProgress size="10rem"/>
        </div>
      </div> : <ProjectGrid
        projects={projects}
      />}
      <br/>
      {/*<Pagination count={10} variant="outlined" shape="rounded" />*/}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Pagination
          count={totalPage}
          page={currentPage}
          onChange={(event, page) => setCurrentPage(page)}
          variant="outlined"
          shape="rounded"
        />
      </Box>
      <br/>
      <br/>
      <br/>
      <br/>
    </Fragment> : null
  )
}
