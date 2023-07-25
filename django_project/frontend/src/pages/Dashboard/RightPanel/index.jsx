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

/* ==========================================================================
   RIGHT SIDE CONTAINER
   ========================================================================== */

import React, { Fragment } from 'react';
import { useSelector } from "react-redux";

import WidgetList from '../../../components/Widget'
import { LEFT, RIGHT } from '../../../components/ToggleButton'
import { EmbedConfig } from "../../../utils/embed";

import './style.scss';

export default function RightPanel({ rightExpanded }) {
  const { widgets } = useSelector(state => state.dashboard.data);
  const state = rightExpanded ? RIGHT : LEFT

  const className = `dashboard__panel dashboard__right_side ${state}`
  return (
    <Fragment>
      <section className={className}>
        <div className='dashboard__content-wrapper'>
          <div className='dashboard__content'>
            <WidgetList widgets={widgets}/>
          </div>
        </div>
      </section>
    </Fragment>
  )
}
