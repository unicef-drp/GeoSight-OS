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
import CircularProgress from '@mui/material/CircularProgress';
import { useDispatch, useSelector } from 'react-redux';

import { Actions } from '../../store/dashboard';
import LeftPanel from './LeftPanel'
import MapLibre from './MapLibre'
import RightPanel from './MiddlePanel/RightPanel'
import MiddlePanel from './MiddlePanel'
import { EmbedConfig } from "../../utils/embed";
import { LEFT, RIGHT } from "../../components/ToggleButton";
import { ProjectOverview } from "./Toolbars";

import './style.scss';

export default function Dashboard({ children }) {
  const dispatch = useDispatch();
  const { user_permission } = useSelector(state => state.dashboard.data);

  const showLayerTab = !!EmbedConfig().layer_tab
  const showFilterTab = !!EmbedConfig().filter_tab
  const showWidget = EmbedConfig().widget_tab
  const [leftExpanded, setLeftExpanded] = useState(showLayerTab || showFilterTab);
  const [rightExpanded, setRightExpanded] = useState(showWidget);

  const leftPanelProps = (showLayerTab || showFilterTab) ? {
    className: 'LeftButton',
    initState: leftExpanded ? LEFT : RIGHT,
    active: leftExpanded,
    onLeft: () => {
      setLeftExpanded(true)
    },
    onRight: () => {
      setLeftExpanded(false)
    }
  } : null

  const rightPanelProps = showWidget ? {
    className: 'RightButton',
    initState: rightExpanded ? RIGHT : LEFT,
    active: rightExpanded,
    onLeft: () => {
      setRightExpanded(false)
    },
    onRight: () => {
      setRightExpanded(true)
    }
  } : null

  // Fetch data of dashboard
  useEffect(() => {
    dispatch(
      Actions.Dashboard.fetch(dispatch)
    )
  }, []);

  return (
    <div
      className={'dashboard ' + (leftExpanded ? 'LeftExpanded' : "")}>
      {user_permission ?
        <Fragment>
          <MapLibre
            leftPanelProps={leftPanelProps}
            rightPanelProps={rightPanelProps}/>
          <LeftPanel leftExpanded={leftExpanded}/>
          <MiddlePanel
            leftExpanded={leftExpanded}
            setLeftExpanded={setLeftExpanded}
            rightExpanded={rightExpanded}
            setRightExpanded={setRightExpanded}
            leftContent={
              <div className='ButtonSection'>
                <ProjectOverview/>
              </div>
            }
            rightContent={
              <RightPanel rightExpanded={rightExpanded}/>
            }
          >
          </MiddlePanel>
        </Fragment> :
        <div className='LoadingElement'>
          <div className='Throbber'>
            <CircularProgress/>
            Loading dashboard data...
          </div>
        </div>
      }
      {children ? children : ""}
    </div>
  );
}