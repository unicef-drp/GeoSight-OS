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
import axios from 'axios';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Admin from "../../index";
import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import { ThemeButton } from "../../../../components/Elements/Button";
import {
  capitalize,
  formatDateTime,
  replaceWithBr
} from "../../../../utils/main";
import { getScheduleText } from "../../../../utils/cron";
import { axiosGet, GeorepoUrls } from "../../../../utils/georepo";
import { resourceActions } from "../Logs";

import '../ImporterDetail/style.scss';
import './style.scss';

export function formatData(value) {
  if ([null, undefined].includes(value)) {
    return '-'
  } else if (Array.isArray(value)) {
    return value.join(', ')
  } else {
    try {
      if (value.includes('/media/')) {
        return <a href={value}>{value.split('/').slice(-1)[0]}</a>
      }
    } catch (err) {

    }
    return value
  }
}

export function formatTitle(title) {
  switch (title.toLowerCase()) {
    case 'key_value':
      title = 'column Value'
      break
    case 'key_administration_code':
      title = 'Geo Code Column'
      break
    case 'row_number_for_header':
      title = 'Row Number For the Header'
      break
  }
  return capitalize(title)
}

export function filterAttributes(attributes) {
  return Object.keys(attributes).filter(
    attr => (
      !['related_table_id', 'selected_indicators_data', 'admin_level_value', 'admin_level_type', 'date_time_data_type', 'date_time_data_value', 'date_time_data_field', 'date_time_data_format', 'selected_indicators', 'sharepoint_config_id'].includes(attr)
      && !attr.includes('aggregate_multiple_value') && !attr.includes('aggregate_upper_level') && !attr.includes('indicator_data')
    )
  )
}


/** Importer detail section */
export function ImporterDetailSection({ inputData }) {
  const [data, setData] = useState(inputData);
  const isIndicatorValue = data.import_type === "Indicator Value"

  useEffect(() => {
    if (data.attributes?.admin_level_type === 'Specific Level') {
      axiosGet(GeorepoUrls.ViewDetail(data.reference_layer)).then(response => response.data).then(response => {
        const level = response.dataset_levels.find(level => level.level + '' === data.attributes?.admin_level_value + '')
        data.attributes.admin_level_type = level ? level.level_name : data.attributes?.admin_level_value
        setData({ ...data })
      });
    }
  }, [])

  return <Fragment>
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <div className='DetailSection'>
          <div>Import Type</div>
          <div>{data.import_type}</div>
        </div>
      </Grid>
      <Grid item xs={3}>
        <div className='DetailSection'>
          <div>Input Format</div>
          <div>{data.input_format}</div>
        </div>
      </Grid>
    </Grid>
    {
      data.attributes.indicator_data_type ?
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <div className='DetailSection'>
              <div>Indicator</div>
              <div>{data.attributes.indicator_data_type === 'By Value' ? 'Selected indicator' : 'Data-Driven Indicator Column'}</div>
            </div>
          </Grid>
          {
            data.attributes.indicator_data_type !== 'By Value' ?
              <Grid item xs={3}>
                <div className='DetailSection'>
                  <div>Indicator Column</div>
                  <div>{data.attributes.indicator_data_field}</div>
                </div>
              </Grid> : null
          }
          <Grid item xs={3}>
            <div className='DetailSection'>
              <div>Indicator Names</div>
              <div>{data.attributes.indicator_data?.name ? data.attributes.indicator_data?.name : data.attributes.indicator_data_names ? data.attributes.indicator_data_names.join(", ") : '-'}</div>
            </div>
          </Grid>
        </Grid> : null
    }
    {
      data.schedule_type !== "Single Import" ?
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <div className='DetailSection'>
              <div>Schedule Type</div>
              <div>{data.schedule_type}</div>
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className='DetailSection'>
              <div>Job Name</div>
              <div>{
                data.job_name ?
                  <a
                    className='MuiButtonLike CellLink'
                    href={data.urls.detail}>
                    {data.job_name}
                  </a> : null
              }</div>
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className='DetailSection'>
              <div>Is Active</div>
              <div>{data.job_active ? 'Active' : 'Paused'}</div>
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className='DetailSection'>
              <div>Schedule</div>
              <div>{data.schedule ? getScheduleText(data.schedule) : '-'}</div>
            </div>
          </Grid>
        </Grid>
        : null
    }
    {
      isIndicatorValue ?
        <Fragment>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Reference Layer</div>
                <div>
                  {formatData(data.reference_layer_name)}
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Type of Geo Code</div>
                <div>
                  {formatData(data.admin_code_type)}
                </div>
              </div>
            </Grid>
            {
              data.attributes?.admin_level_type ? <Grid item xs={3}>
                <div className='DetailSection'>
                  <div>Admin Level</div>
                  <div>
                    {data.attributes?.admin_level_type === 'Specific Level' ? 'Loading' : formatData(data.attributes?.admin_level_type)}
                  </div>
                </div>
              </Grid> : null
            }
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className='DetailSection'>
                <div>Date Time Setting</div>
                <div>
                  <div>{data.attributes.date_time_data_type === 'By Value' ? 'Selected Date' : formatData(data.attributes.date_time_data_type)}</div>
                </div>
              </div>
            </Grid>
            {
              data.attributes.date_time_data_type === 'Data Driven' ?
                <Fragment>
                  <Grid item xs={3}>
                    <div className='DetailSection'>
                      <div>Date Time Column/Field</div>
                      {
                        formatData(data.attributes.date_time_data_field)
                      }
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div className='DetailSection'>
                      <div>Date Time Format</div>
                      {
                        formatData(
                          data.attributes?.date_time_data_format?.replace('%Y', 'YYYY').replace('%m', 'MM').replace('%d', 'DD').replace('%h', 'HH').replace('%m', 'MM').replace('%s', 'SS')
                        )
                      }
                    </div>
                  </Grid>
                </Fragment> : data.attributes.date_time_data_type === 'Now' ? null :
                  <Grid item xs={3}>
                    <div className='DetailSection'>
                      <div>Date Time of Data</div>
                      {
                        formatData(formatDateTime(new Date(data.attributes.date_time_data_value), false, true))
                      }
                    </div>
                  </Grid>
            }
          </Grid>
        </Fragment> : null
    }

    {/* Other Attributes */
    }
    <Grid container spacing={2}>
      {
        data.attributes.selected_indicators_data ?
          <Grid item xs={3}>
            <div className='DetailSection'>
              <div>Selected Indicators</div>
              <div
                title={formatData(data.attributes.selected_indicators_data)}>
                {formatData(data.attributes.selected_indicators_data)}
              </div>
            </div>
          </Grid> : null
      }
      {
        filterAttributes(data.attributes).map(attr => {
          return <Grid key={attr} item xs={3}>
            <div className='DetailSection'>
              <div>{formatTitle(attr)}</div>
              <div title={formatData(data.attributes[attr])}>
                {formatData(data.attributes[attr])}
              </div>
            </div>
          </Grid>
        })
      }
    </Grid>

    {/* Aggregations multiple value */
    }
    <Grid container spacing={2}>
      {
        Object.keys(data.attributes).filter(
          attr => (attr.includes('aggregate_multiple_value'))
        ).map(attr => {
          if (attr === 'aggregate_multiple_value') {
            if ([false, 'false', 'Last value'].includes(data.attributes[attr])) {
              data.attributes[attr] = 'Last value'
            } else {
              data.attributes[attr] = 'Aggregate'
            }
          }
          return <Grid key={attr} item xs={3}>
            <div className='DetailSection'>
              <div>{capitalize(attr)}</div>
              <div>{formatData(data.attributes[attr])}</div>
            </div>
          </Grid>
        })
      }
    </Grid>

    {/* Aggregations upper level */
    }
    <Grid container spacing={2}>
      {
        Object.keys(data.attributes).filter(
          attr => (attr.includes('aggregate_upper_level'))
        ).map(attr => {
          return <Grid key={attr} item xs={3}>
            <div className='DetailSection'>
              <div>{capitalize(attr)}</div>
              <div>{formatData(data.attributes[attr])}</div>
            </div>
          </Grid>
        })
      }
    </Grid>
  </Fragment>
}

/**
 * Importer Log Detail
 */
export default function ImporterLogDetail() {
  const [data, setData] = useState(null);

  /** Call API
   */
  const callApi = () => {
    axios.get(urls.api.detail).then(response => {
      const detailData = response.data
      setData(detailData)
      if (!['Success', 'Failed'].includes(detailData.status)) {
        setTimeout(function () {
          callApi()
        }, 1000);
      }
    }).catch(error => {
      setTimeout(function () {
        callApi()
      }, 5000);
    })
  }

  useEffect(() => {
    callApi()
  }, [])

  // If not data, return empty
  if (!data) {
    return <Admin pageName={'Log Detail'}></Admin>
  }

  let color = 'info.main'
  switch (data.status) {
    case 'Failed':
      color = 'error.main'
      break
    case 'Success':
      color = 'success.main'
      break
  }
  let note = data.note
  if (note) {
    note = data.note.replaceAll(/Indicator.*?does not allow aggregating upper levels./g, function (matched) {
      return '<div class="warning">' + matched + '</div>'
    })
  }
  const isEnded = ['Success', 'Failed'].includes(data.status)
  let text = ''
  if (isEnded) {
    text = data.status
  } else {
    text = `${data.status} ` + (note ? ` - ${note} ` : '') + (data.progress ? `(${data.progress}%)` : '')
  }
  return <Admin
    pageName={'Log Detail'}
    rightHeader={
      <Fragment>
        {
          data?.id ?
            resourceActions({
              id: data?.id,
              row: data
            }) : null
        }
        <a href={data.urls.edit}>
          <ThemeButton
            variant="primary"
            disabled={!isEnded}
          >
            Edit and rerun
          </ThemeButton>
        </a>
      </Fragment>
    }
  >
    <div className='FlexScrollableSection Detail'>
      <div className='StatusSection'>
        <Box sx={{
          bgcolor: color,
          zIndex: 1,
          color: 'primary.contrastText',
          minWidth: '150px',
          width: ['Failed', 'Success'].includes(data.status) ? '100%' : data.progress + '%',
          p: 1
        }} className='BoxText'>
          {text}
        </Box>
        <div className='WhiteText'>
          {text}
        </div>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <div className='DetailSection'>
            <div>Start At</div>
            <div>{formatDateTime(new Date(data.start_time))}</div>
          </div>
        </Grid>
        <Grid item xs={3}>
          <div className='DetailSection'>
            <div>End At</div>
            <div>
              {data.end_time ? formatDateTime(new Date(data.end_time)) : null}
            </div>
          </div>
        </Grid>
        {
          data.status === 'Success' ?
            <Grid item xs={6}>
              <div className='DetailSection'>
                {
                  note ? <Fragment>
                    <div>Note</div>
                    <div
                      dangerouslySetInnerHTML={{ __html: replaceWithBr(note) }}/>
                  </Fragment> : null
                }
                <div className='title'>Saved Data</div>
                <div className='DetailDataFound'>
                  <div>{data.saved_data} / {data.count_data}</div>
                  <a href={data.browse_url}>
                    <ThemeButton variant="primary">
                      See the data
                    </ThemeButton>
                  </a>
                </div>
              </div>
            </Grid> : null
        }
        {
          data.status === 'Failed' ?
            <Grid item xs={6}>
              <div className='DetailSection'>
                <div>Error</div>
                <div className='DetailDataFound'>
                  <div className='DetailDataFoundError'>
                    <div
                      dangerouslySetInnerHTML={{ __html: replaceWithBr(note) }}></div>
                  </div>
                  <div className='DetailButtonButton'>
                    <div className='Separator'/>
                    <a href={urls.api.dataView+'?status=Warning and Error'}>
                      <ThemeButton
                        variant="primary">
                        See the data
                      </ThemeButton>
                    </a>
                  </div>
                </div>
              </div>
            </Grid> : null
        }
      </Grid>
      <ImporterDetailSection inputData={data}/>
    </div>
  </Admin>
}

render(ImporterLogDetail, store)