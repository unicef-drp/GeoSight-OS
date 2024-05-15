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
 * __author__ = 'francisco.perez@geomatico.es'
 * __date__ = '08/04/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import { fetchingData } from '../../Requests';
import WhereQueryGenerator from '../SqlQueryGenerator/WhereQueryGenerator';
import { dictDeepCopy, toJson } from '../../utils/main';
import { getRelatedTableFields } from '../../utils/relatedTable';
import { Actions } from '../../store/dashboard';
import { useDispatch } from 'react-redux';

/**
 * Slicers for Related Table Context Layers.
 */

const SidePanelSlicers = ({ data }) => {

  const dispatch = useDispatch();

  const [relatedTableInfo, setRelatedTableInfo] = useState(null)
  const [relatedTableData, setRelatedTableData] = useState(null)


  /** Update fields to required fields **/
  const updateFields = (fields) => {
    if (!fields) {
      return fields
    }
    return fields.map(field => {
      return {
        name: field.name,
        type: field.type ? field.type : 'text',
        value: field.name,
        options: field?.options
      }
    })
  }

  // Loading data
  useEffect(() => {
    if (!open) {
      return
    }
    if (data.related_table) {
      const params = {}
      const url_info = `/api/related-table/${data.related_table}`
      const url_data = `/api/related-table/${data.related_table}/data`
      setRelatedTableInfo(null)
      setRelatedTableData(null)
      fetchingData(
        url_data, params, {}, function (response, error) {
          setRelatedTableData(dictDeepCopy(response))
        }
      )
      fetchingData(
        url_info, params, {}, function (response, error) {
          setRelatedTableInfo(dictDeepCopy(response))
        }
      )
    }
  }, [data.related_table])


  const relatedFields = relatedTableInfo && relatedTableData ? getRelatedTableFields(relatedTableInfo, relatedTableData) : []
  const configuration = toJson(data.configuration);
  const {
    query
  } = configuration;
  if (!query) {
    return null;
  }
  return <div
    className={'ContextLayerMiddleConfig ' + (open ? 'Open' : '')}>
    <Fragment>
      <div
        id='RelatedTableLayerMiddleConfigReal'
        className='WhereConfigurationWrapper'
      >
        <WhereQueryGenerator
          fields={updateFields(relatedFields)}
          isCompact={true}
          whereQuery={query}
          setWhereQuery={(where) => {
            if (JSON.stringify(query) !== JSON.stringify(where)) {
              data.configuration = { ...configuration, query: where }
              dispatch(Actions.ContextLayers.update(data))
            }
          }}
          disabledChanges={{
            add: true,
            remove: true,
            sql: true,
            and_or: true,
            field: true,
            operator: true,
          }}
        />
      </div>
    </Fragment>
  </div>
};

export default SidePanelSlicers;