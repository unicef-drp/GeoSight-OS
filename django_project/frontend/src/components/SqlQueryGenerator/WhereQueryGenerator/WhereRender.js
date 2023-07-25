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

import React from "react";
import { TYPE } from "../../../utils/queryExtraction";
import WhereGroup from "./WhereGroup"
import WhereInput from "./WhereInput"

export default function WhereRender(
  { where, upperWhere, updateWhere, fields, disabledChanges = {}, ...props }) {
  switch (where.type) {
    case TYPE.GROUP:
      return <WhereGroup
        where={where} upperWhere={upperWhere} updateWhere={updateWhere}
        fields={fields} disabledChanges={disabledChanges}
        {...props}
      />
    case TYPE.EXPRESSION:
      return <WhereInput
        where={where} upperWhere={upperWhere} updateWhere={updateWhere}
        fields={fields} disabledChanges={disabledChanges}
        {...props}
      />
    default:
      return ''
  }
}