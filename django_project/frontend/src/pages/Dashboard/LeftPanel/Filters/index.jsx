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
   Filters SELECTOR
   ========================================================================== */

import React from 'react';
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import FilterContent from "../../../../components/Map/Filter/FilterContent";

import './style.scss';


/**
 * Filters Accordion.
 */
export default function FiltersAccordion({ isAdmin }) {
  return (
    <Accordion
      className='FilterAccordion'
      expanded={true}
    >
      <AccordionDetails>
        <FilterContent isAdmin={isAdmin}/>
      </AccordionDetails>
    </Accordion>
  )
}