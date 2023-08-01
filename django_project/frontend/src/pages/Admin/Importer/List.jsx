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

import React from 'react';

import { render } from '../../../app';
import { store } from '../../../store/admin';
import { MultipleAdminContent } from "../MultipleAdminContent";
import { pageNames } from "../index";
import ImporterLogs from "./Logs";
import ScheduledJobs from "./ScheduledJobs";


/**
 * Data management list
 */
export default function DataManagementList({ defaultTab }) {
  return <MultipleAdminContent
    pageName={pageNames.DataManagement}
    defaultTab={defaultTab}
    contents={{
      'Logs': <ImporterLogs/>,
      'Scheduled Jobs': <ScheduledJobs/>,
    }}
  />
}

render(DataManagementList, store)