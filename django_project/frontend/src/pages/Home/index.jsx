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
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '13/06/2023'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import ImageIcon from '@mui/icons-material/Image';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { store } from '../../store/admin';
import { render } from '../../app';

import { SearchInput } from "../../components/Input/IconInput";
import { ThemeButton } from "../../components/Elements/Button";
import {
  MultipleSelectWithSearch,
  SelectWithSearch
} from "../../components/Input/SelectWithSearch";
import {
  SortAscIcon,
  SortDescIcon,
  VisibilityIcon
} from "../../components/Icons";
import Footer from "../../components/Footer";
import BasicPage from '../Basic'

import './style.scss';


/** Project Grid */
function ProjectGrid({ projects }) {
  return <Grid container spacing={2}>
    {
      projects.map((project, idx) => (
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
                {project.category ? <div>{project.category} | {project.created_at} | {project.modified_at} </div> : null}
              </div>
            </a>
          </div>
        </Grid>
      ))
    }
  </Grid>
}

/**
 * Home Page App
 */
export default function Home() {
  // const [searchSharedProject, setSearchSharedProject] = useState('');
    const [projectsState, setProjectsState] = useState({
      ownProjects: {
        search: '',
        selectedCategories: [],
        selectedSortBy: 'Name',
        selectedSortByAsc: true,
        categories: [],
      },
      sharedProjects: {
        search: '',
        selectedCategories: [],
        selectedSortBy: 'Name',
        selectedSortByAsc: true,
        categories: []
      },
    });
    console.log(projectsState.ownProjects)

  // const [searchProject, setSearchProject] = useState('');
  // const [selectedCategories, setSelectedCategories] = useState([]);
  // const [selectedSortBy, setSelectedSortBy] = useState('Name');
  // const [selectedSortByAsc, setSelectedSortByAsc] = useState(true);

  const [projects, setProjects] = useState(null);
  const [showBanner, setShowBanner] = useState(true);

    // Update state function
  const updateProjectState = (type, key, value) => {
    console.log(`${type} | ${key} | ${value}`);
    setProjectsState((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        [key]: value,
      },
    }));
  };


  // Fetch data
  useEffect(() => {
    axios.get('/api/dashboard/list').then(response => {
      // const categories = response.data.filter(project => project.category).map(project => project.category)
      const own = response.data.filter(row => row.creator === user.id);
      const shared = response.data.filter(row => row.creator !== user.id);
      // setSelectedCategories([...new Set(categories)])
      const ownCategories = [...new Set(own.filter(project => project.category).map(project => project.category))];
      const sharedCategories = [...new Set(shared.filter(project => project.category).map(project => project.category))];
      updateProjectState(
        'ownProjects',
        'selectedCategories',
        ownCategories
      )
      updateProjectState(
        'sharedProjects',
        'selectedCategories',
        sharedCategories
      )
      setProjects({
        own: own,
        shared: shared
      })
    }).catch(error => {
    })
  }, [])

  // Create category
  let ownCategories = [];
  let sharedCategories = [];
  if (projects) {
    ownCategories = [...new Set(projects.own.filter(project => project.category).map(project => project.category))];
    sharedCategories = [...new Set(projects.shared.filter(project => project.category).map(project => project.category))];
  }

  // We do filter and sort
  const filterAndSortProjects = (projectType, projectsList) => {
    if (!projectsList) return null;

    const selectedCategories = projectsState[projectType].selectedCategories;
    const selectedSortBy = projectsState[projectType].selectedSortBy;
    const selectedSortByAsc = projectsState[projectType].selectedSortByAsc;

    // Filter projects
    let filteredProjects = projectsList.filter(
      (project) =>
        (selectedCategories.length === 0 && !project.category) ||
        selectedCategories.includes(project.category)
    );

    // Sort projects
    filteredProjects.sort((a, b) => {
      let sorted = 0;
      switch (selectedSortBy) {
        case 'Name':
          sorted = a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
          break;
        case 'Date created':
          sorted = a.created_at < b.created_at ? -1 : 1;
          break;
        case 'Date modified':
          sorted = a.modified_at < b.modified_at ? -1 : 1;
          break;
        default:
          break;
      }
      return selectedSortByAsc ? sorted : -sorted;
    });

    return filteredProjects;
  };

  // Usage for sharedProjects and ownProjects
  let sharedProjects = projects?.shared;
  let ownProjects = projects?.own;

  if (sharedProjects) {
    sharedProjects = filterAndSortProjects('sharedProjects', sharedProjects);
  }

  if (ownProjects) {
    ownProjects = filterAndSortProjects('ownProjects', ownProjects);
    console.log(ownProjects);
  }


  return (
    <BasicPage className='Home'>
      {
        mainImage ?
          <banner className={showBanner ? '' : 'Hide'}>
            <div className='BannerContent'>
              <div className='Separator'/>
              {
                preferences.landing_page_banner_text ?
                  <div dangerouslySetInnerHTML={{
                    __html: preferences.landing_page_banner_text
                  }}/>
                  :
                  null
              }
              <ThemeButton
                variant="primary Basic HideBanner"
                onClick={_ => setShowBanner(false)}>
                Hide this banner <HighlightOffIcon/>
              </ThemeButton>
            </div>
            <ThemeButton
              variant="Basic ShowBanner"
              onClick={_ => setShowBanner(true)}>
              <VisibilityIcon/> Show banner
            </ThemeButton>
          </banner> : null
      }
      <div className={'HomePageContent ' + (!projects ? 'Loading' : '')}>
        {
          !projects ? (
            <div className='LoadingElement'>
              <div className='Throbber'>
                <CircularProgress size="10rem"/>
              </div>
            </div>
          ) : projects?.own?.length ?
              <Fragment>
                <div className='PageContent-Title'>
                  Your projects <div className='Separator'/>
                </div>
                <div style={{flexGrow: 1}}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={6} xl={6}>
                      <SearchInput
                          className='SearchInput'
                          placeholder='Search projects' value={projectsState.ownProjects.search}
                          onChange={(value) => updateProjectState('ownProjects', 'search', value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={3} lg={3} xl={2}>
                      <MultipleSelectWithSearch
                          value={projectsState.ownProjects.selectedCategories}
                          onChangeFn={(value) => {
                            updateProjectState('ownProjects', 'selectedCategories', value)
                          }}
                          options={ownCategories}
                          className='CategorySelector'
                      />
                    </Grid>
                    <Grid item xs={12} md={3} lg={3} xl={2}>
                      <SelectWithSearch
                        value={projectsState.ownProjects.selectedSortBy}
                        onChangeFn={(value) => {
                          updateProjectState('ownProjects', 'selectedSortBy', value)
                        }}
                        options={['Name', 'Date created', 'Date modified']}
                        className='SortSelector'
                        parentClassName='SortSelectorInput'
                        iconStart={
                          <div
                            onClick={_ => updateProjectState(
                                'ownProjects',
                                'selectedSortByAsc',
                                !projectsState.ownProjects.selectedSortByAsc
                            )
                          }>
                            {projectsState.ownProjects.selectedSortByAsc ? <SortAscIcon/> : <SortDescIcon/>}
                          </div>
                        }
                      />
                    </Grid>
                  </Grid>
                </div>
                <ProjectGrid
                    projects={
                      ownProjects.filter(
                          project => !projectsState.ownProjects.search ||
                              project.name.includes(projectsState.ownProjects.search) ||
                              project.description?.includes(projectsState.ownProjects.search)
                      )
                    }
                />
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
              </Fragment> : null
        }
        {/*{*/}
        {/*  !projects?.shared?.length ? null : (*/}
        {/*      <Fragment>*/}
        {/*        <div className='PageContent-Title'>*/}
        {/*          Other shared projects*/}
        {/*        </div>*/}
        {/*        <div className='PageContent-Title'>*/}
        {/*          <div style={{flexGrow: 1}}>*/}
        {/*            <MultipleSelectWithSearch*/}
        {/*                value={selectedCategories}*/}
        {/*                onChangeFn={(value) => {*/}
        {/*                  setSelectedCategories(value)*/}
        {/*                }}*/}
        {/*                options={categories}*/}
        {/*                className='CategorySelector'*/}
        {/*            />*/}
        {/*          </div>*/}
        {/*          <SelectWithSearch*/}
        {/*              value={selectedSortBy}*/}
        {/*              onChangeFn={(value) => {*/}
        {/*                setSelectedSortBy(value)*/}
        {/*              }}*/}
        {/*              options={['Name', 'Date created', 'Date modified']}*/}
        {/*              className='SortSelector'*/}
        {/*              parentClassName='SortSelectorInput'*/}
        {/*          iconStart={*/}
        {/*            <div*/}
        {/*              onClick={_ => setSelectedSortByAsc(_ => !_)}>*/}
        {/*              {selectedSortByAsc ? <SortAscIcon/> : <SortDescIcon/>}*/}
        {/*            </div>*/}
        {/*          }*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*      <ProjectGrid projects={sharedProjects}/>*/}
        {/*    </Fragment>*/}
        {/*  )*/}
        {/*}*/}
      </div>
      <div>
        <Footer/>
      </div>
    </BasicPage>
  )
}

render(Home, store)