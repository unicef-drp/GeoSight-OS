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

import React, { Fragment } from "react";
import WhereRender from "./WhereRender"
import { TYPE, WHERE_OPERATOR } from "../../../utils/queryExtraction";

export default function WhereGroup(
  { where, upperWhere, updateWhere, fields, disabledChanges = {}, ...props }) {
  return <div className='WhereConfigurationQueryGroup'>
    {
      where.queries.length > 0 ?
        where.queries.map(
          (query, idx) => {
            return <Fragment key={idx}>
              <WhereRender
                where={query} upperWhere={where}
                updateWhere={updateWhere} fields={fields}
                disabledChanges={disabledChanges}
                {...props}
              />
              {
                idx === where.queries.length - 1 ? null :
                  <Fragment>
                    <div
                      className={'WhereConfigurationOrAndWrapper'}>
                      <div
                        className={'WhereConfigurationOrAndInnerWrapper ' + (disabledChanges.and_or ? 'Disabled' : '')}
                        onClick={() => {
                          if (!disabledChanges.and_or) {
                            if (query.type === TYPE.GROUP) {
                              query.operator = query.operator === WHERE_OPERATOR.AND ? WHERE_OPERATOR.OR : WHERE_OPERATOR.AND;
                            } else {
                              query.whereOperator = query.whereOperator === WHERE_OPERATOR.AND ? WHERE_OPERATOR.OR : WHERE_OPERATOR.AND;
                            }
                            updateWhere()
                          }
                        }}
                      >
                        <div
                          className={'WhereConfigurationOrAnd ' + (query.whereOperator ? query.whereOperator : query.operator)}>
                          <div className='AND'>{WHERE_OPERATOR.AND}</div>
                          <div className='OR'>{WHERE_OPERATOR.OR}</div>
                        </div>
                      </div>
                    </div>
                  </Fragment>
              }
            </Fragment>
          }
        )
        :
        <div className='WhereConfigurationNote'>No filter</div>
    }
  </div>
}