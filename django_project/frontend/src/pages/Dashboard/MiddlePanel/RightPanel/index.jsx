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

import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";

import WidgetList from '../../../../components/Widget'
import { LEFT, RIGHT } from '../../../../components/ToggleButton'

import './style.scss';

export default function RightPanel({ rightExpanded }) {
  const {
    widgets,
    widgetsStructure
  } = useSelector(state => state.dashboard.data);
  const [state, setState] = useState(rightExpanded ? RIGHT : LEFT)

  useEffect(() => {
    setState(rightExpanded ? RIGHT : LEFT)
  }, [rightExpanded])

  const className = `${state}`
  return (
    <Fragment>
      {
        widgets?.filter(widget => widget.visible_by_default).length ?
          <section className={className}>
            <div className='dashboard__content-wrapper'>
              <div className='dashboard__content'>
                <WidgetList
                  widgets={widgets}
                  widgetsStructure={widgetsStructure}
                />
              </div>
            </div>
          </section> : null
      }
    </Fragment>
  )
}
