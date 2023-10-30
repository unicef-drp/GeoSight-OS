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
 * Home Page App
 */
export default function Home() {
  const [searchProject, setSearchProject] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSortBy, setSelectedSortBy] = useState('Name');
  const [selectedSortByAsc, setSelectedSortByAsc] = useState(true);

  const [projects, setProjects] = useState(null);
  const [showBanner, setShowBanner] = useState(true);


  // Fetch data
  useEffect(() => {
    axios.get('/api/dashboard/list').then(response => {
      setSelectedCategories(response.data.filter(project => project.category).map(project => project.category))
      setProjects({
        own: response.data.filter(row => row.creator === user.id),
        shared: response.data.filter(row => row.creator !== user.id)
      })
    }).catch(error => {
    })
  }, [])

  // Create category
  let categories = [];
  if (projects) {
    categories = projects.own.concat(projects.shared).filter(project => project.category).map(project => project.category);
  }

  // We do filter and sort
  let sharedProjects = projects?.shared
  if (sharedProjects) {
    sharedProjects = sharedProjects.filter(project => (selectedCategories.length === categories.length && !project.category) || selectedCategories.includes(project.category))
    sharedProjects.sort((a, b) => {
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
        return selectedSortByAsc ? -1 : 0
      }
      return selectedSortByAsc ? 0 : -1
    });
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
                <SearchInput
                  className='SearchInput'
                  placeholder='Search projects' value={searchProject}
                  onChange={setSearchProject}/>
              </div>
              <ProjectGrid
                projects={
                  projects.own.filter(
                    project => !searchProject || project.name.includes(searchProject) || project.description?.includes(searchProject)
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
        {
          !projects?.shared?.length ? null : (
            <Fragment>
              <div className='PageContent-Title'>
                Other shared projects
              </div>
              <div className='PageContent-Title'>
                <div style={{ flexGrow: 1 }}>
                  <MultipleSelectWithSearch
                    value={selectedCategories}
                    onChangeFn={(value) => {
                      setSelectedCategories(value)
                    }}
                    options={categories}
                    className='CategorySelector'
                  />
                </div>
                <SelectWithSearch
                  value={selectedSortBy}
                  onChangeFn={(value) => {
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
              </div>
              <ProjectGrid projects={sharedProjects}/>
            </Fragment>
          )
        }
      </div>
      <div>
        <Footer/>
      </div>
    </BasicPage>
  )
}

render(Home, store)