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
 * __date__ = '25/04/2024'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { Fragment, useEffect, useState } from 'react';
import axios from "axios";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import { render } from '../../../../app';
import { store } from '../../../../store/admin';
import Admin, { pageNames } from '../../index';
import { formatDateTime, replaceWithBr } from "../../../../utils/main";
import { ThemeButton } from "../../../../components/Elements/Button";

import '../../Importer/ImporterDetail/style.scss';
import '../../Importer/LogDetail/style.scss';


/**
 * Importer detail
 */
export default function ImporterDetail() {
  const [data, setData] = useState(null);

  /** Call API **/
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
      }, 1000);
    })
  }
  useEffect(() => {
    callApi()
  }, [])

  // If not data, return empty
  if (!data) {
    return <Admin pageName={pageNames.ReferenceLayerView}></Admin>
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
  const isEnded = ['Success', 'Failed'].includes(data.status)
  let text = ''
  if (isEnded) {
    text = data.status
  } else {
    text = `${data.status} ` + (note ? ` - ${note} ` : '') + (data.progress ? `(${data.progress}%)` : '')
  }

  return (
    <Admin
      pageName={pageNames.ReferenceLayerView}
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
                  <div className='DetailDataFound'>
                    <a href={urls.api.browseData}>
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
                      <a href={urls.api.dataView}>
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
        {
          data.levels.map(
            (level, idx) =>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <div className='DetailSection'>
                    <div>Level {level.level}</div>
                    <div><a
                      href={level.file}>{level.name.split('/')[level.name.split('/').length - 1]}</a>
                    </div>
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className='DetailSection'>
                    <div>Name field</div>
                    <div>{level.name_field}</div>
                  </div>
                </Grid>
                <Grid item xs={3}>
                  <div className='DetailSection'>
                    <div>Ucode field</div>
                    <div>{level.ucode_field}</div>
                  </div>
                </Grid>
                {
                  idx !== 0 ?
                    <Grid item xs={3}>
                      <div className='DetailSection'>
                        <div>Parent ucode field</div>
                        <div>{level.parent_ucode_field}</div>
                      </div>
                    </Grid> : null
                }

              </Grid>
          )
        }
      </div>
    </Admin>
  );
}

render(ImporterDetail, store)