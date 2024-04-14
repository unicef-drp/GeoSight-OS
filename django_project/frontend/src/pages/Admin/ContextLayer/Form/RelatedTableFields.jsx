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
 * __author__ = 'francisco.perez@geomati.co'
 * __date__ = '20/03/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import $ from 'jquery';


import { SelectWithSearch } from "../../../../components/Input/SelectWithSearch";
import WhereInputModal from "../../../../components/SqlQueryGenerator/WhereInputModal";
import { getRelatedTableFields } from "../../../../utils/relatedTable";
import { fetchingData } from "../../../../Requests";
import { dictDeepCopy } from "../../../../utils/main";
import {
  RelatedTableInputSelector
} from "../../ModalSelector/InputSelector";

/**
 * Indicator Form App
 * @param {dict} data Data of context layer.
 * @param {boolean} checkConfig Checking config.
 */
export default function RelatedTableFields(
  {
    data,
    onSetData
  }
) {
  const [relatedTableInfo, setRelatedTableInfo] = useState(null)
  const [relatedTableData, setRelatedTableData] = useState(null)

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

  useEffect(() => {
    if (relatedFields && !data.data_fields) {
      onSetData({
        ...data,
        data_fields: relatedFields.map(field => ({
          alias: field.alias,
          defaultValue: null,
          domain: null,
          editable: false,
          name: field.name,
          nullable: false,
          sqlType: "sqlTypeOther",
          type: field.type
        }))
      })
    }
  }, [relatedFields])

  const handleRelatedTableChange = newRelatedTable => {
    onSetData({ ...data, related_table: newRelatedTable[0]?.id })
    setRelatedTableInfo(newRelatedTable[0])
  }

  return (
    <div>
      <div className='BasicFormSection'>
        <div>
          <label className="form-label required">
            Related Table
          </label>
        </div>
        <RelatedTableInputSelector
          data={relatedTableInfo ? [relatedTableInfo] : []}
          setData={handleRelatedTableChange}
          isMultiple={false}
          showSelected={true}
        />
      </div>
      <div className='BasicFormSection'>
        <div className='form-label'>Latitude Field</div>
        <div className='InputInLine'>
          <SelectWithSearch
            value={data.latitude_field}
            onChangeFn={evt => {
              onSetData({ ...data, latitude_field: evt })
            }}
            options={relatedFields.filter(rf => rf.type === 'number').map(rf => rf.name)}
            className='FilterInput' />
        </div>
      </div>
      <div className='BasicFormSection'>
        <div className='form-label'>Longitude Field</div>
        <div className='InputInLine'>
          <SelectWithSearch
            value={data.longitude_field}
            onChangeFn={evt => {
              onSetData({ ...data, longitude_field: evt })
            }}
            options={relatedFields.filter(rf => rf.type === 'number').map(rf => rf.name)}
            className='FilterInput' />
        </div>
      </div>
      <div className='BasicFormSection'>
        <div className='form-label'>Datetime field</div>
        <div className='InputInLine'>
          <SelectWithSearch
            value={data.datetime_field}
            onChangeFn={evt => {
              onSetData({ ...data, datetime_field: evt })
            }}
            options={relatedFields.filter(rf => rf.type === 'date').map(rf => rf.name)}
            className='FilterInput' />
        </div>
      </div>

      <WhereInputModal
        value={data.query ? data.query : ''}
        fields={relatedFields}
        setValue={evt => {
          onSetData({ ...data, query: evt })
        }}
        title={"Filter the Data"}
      />
    </div>
  )
}