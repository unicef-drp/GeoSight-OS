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

import React, { useEffect, useState } from 'react';
import Grid from "@mui/material/Grid";

import {
  SelectWithSearch
} from "../../../../components/Input/SelectWithSearch";
import WhereInputModal
  from "../../../../components/SqlQueryGenerator/WhereInputModal";
import { getRelatedTableFields } from "../../../../utils/relatedTable";
import { fetchingData } from "../../../../Requests";
import { dictDeepCopy } from "../../../../utils/main";
import { RelatedTableInputSelector } from "../../ModalSelector/InputSelector";
import { SelectWithList } from "../../../../components/Input/SelectWithList";

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
  // Create the source
  let configuration;
  try {
    if (typeof data.configuration === 'string' || data.configuration instanceof String) {
      configuration = JSON.parse(data.configuration)
    } else {
      configuration = data.configuration
    }
  } catch (e) {
    configuration = {}
  }
  const {
    field_aggregation,
    latitude_field,
    longitude_field,
    query
  } = configuration;

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

  const fieldOptions = relatedFields ? relatedFields.filter(
    field => ['Number', 'number'].includes(field.type)
  ).map(field => field.name) : []

  return (
    <>
      <div className='BasicFormSection'>
        <label className="form-label required">
          Related Table
        </label>
        <RelatedTableInputSelector
          data={relatedTableInfo ? [relatedTableInfo] : []}
          setData={handleRelatedTableChange}
          isMultiple={false}
          showSelected={true}
        />
      </div>
      <div className='BasicFormSection'>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <div className='form-label'>Latitude Field</div>
            <div className='InputInLine'>
              <SelectWithSearch
                value={latitude_field ? latitude_field : ''}
                onChangeFn={evt => {
                  onSetData({
                    ...data,
                    configuration: { ...configuration, latitude_field: evt }
                  })
                }}
                options={relatedFields.filter(rf => rf.type === 'number').map(rf => rf.name)}
                className='FilterInput'
                disableCloseOnSelect={false}
              />
            </div>
            <div>
              <span className="form-helptext">
                The field name that will be used as Latitude.
              </span>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className='form-label'>Longitude Field</div>
            <div className='InputInLine'>
              <SelectWithSearch
                value={longitude_field ? longitude_field : ''}
                onChangeFn={evt => {
                  onSetData({
                    ...data,
                    configuration: { ...configuration, longitude_field: evt }
                  })
                }}
                options={relatedFields.filter(rf => rf.type === 'number').map(rf => rf.name)}
                className='FilterInput'
                disableCloseOnSelect={false}
              />
            </div>
            <div>
              <span className="form-helptext">
                The field name that will be used as Longitude.
              </span>
            </div>
          </Grid>
        </Grid>
      </div>
      <div className='BasicFormSection WhereInput'>
        <WhereInputModal
          value={query ? query : ''}
          fields={relatedFields}
          setValue={evt => {
            onSetData({
              ...data,
              configuration: { ...configuration, query: evt }
            })
          }}
          title={"Filter"}
        />
        <div>
          <span className="form-helptext">
            This will be used to filter the data by default.<br/>
            It will also create slicer on the website that will be used for user
            to change the filter.
          </span>
        </div>
      </div>
      <div className='BasicFormSection Aggregation'>
        <label className="form-label">
          Aggregate data by field name
        </label>
        <SelectWithList
          list={
            [
              {
                name: '------------------------',
                value: null,
              },
              ...fieldOptions]
          }
          placeholder={!relatedFields ? "Loading" : "Select.."}
          value={field_aggregation ? field_aggregation : null}
          isDisabled={!data.data_fields}
          onChange={evt => {
            onSetData({
              ...data,
              configuration: { ...configuration, field_aggregation: evt.value }
            })
          }}/>
        <div>
          <span className="form-helptext">
            Field name that will be used to aggregate data.
            Aggregation will be use to make clustering of the points on the map.
          </span>
        </div>
      </div>
    </>
  )
}