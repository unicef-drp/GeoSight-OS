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
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import MapConfig from './Map'
import ArcgisConfig from './Arcgis'
import { useDispatch } from "react-redux";
import { getLayer } from '../../../Dashboard/LeftPanel/ContextLayers/Layer'
import { defaultPointStyle } from './layerStyles';
import RelatedTableConfig from './RelatedTable';
import AggregationStyleConfig from "./AggregationStyleConfig";

import './style.scss';


/**
 * Indicator Form App
 * @param {dict} data Data of context layer.
 * @param {boolean} checkConfig Checking config.
 */
export default function StyleConfig(
  {
    data,
    setData,
    useOverride = false,
    defaultTab = null,
    useOverrideLabel = true,
    children
  }
) {
  const dispatch = useDispatch();
  const [layer, setLayer] = useState(null);
  const [error, setError] = useState(null);
  const [legend, setLegend] = useState(null);

  const [layerData, setLayerData] = useState(null);
  const [layerDataClass, setLayerDataClass] = useState(null);
  const [tab, setTab] = useState(data.layer_type === 'ARCGIS' ? 'Fields' : 'Preview');

  useEffect(() => {
    if (defaultTab) {
      setTab(defaultTab)
    }
  }, [defaultTab]);

  useEffect(() => {
    setLayer(null)
    setError(null)
    setLegend(null)
    getLayer(data, setLayer, setLegend, setError, dispatch, setLayerDataClass);
  }, [data, tab]);

  useEffect(() => {
    if (!data.styles && ['Related Table', 'Vector Tile'].includes(data.layer_type)) {
      setData({
        ...data,
        styles: JSON.stringify(defaultPointStyle, null, 4),
        override_style: true
      })
    }
  }, [data]);

  useEffect(() => {
    if (layerDataClass) {
      setLayerData(layerDataClass)
    }
  }, [layer, error, legend]);

  return (
    <div className={'ContextLayerConfig-Wrapper ' + tab}>
      <div className='form-helptext'>
        Below is for checking the configuration, overriding style and updating
        popup.
      </div>
      {
        error ?
          <div className='error'>{error.toString()}</div>
          : ""
      }
      <div className='AdminForm'>
        {/* FOR CONFIG */}
        <div className='TabPrimary ContextLayerConfigTab'>
          {
            data.layer_type === 'Related Table' ?
              <>
                <div
                  onClick={() => {
                    setTab('General_Override')
                  }}
                  className={tab === 'General' ? 'Selected' : ""}
                >
                  General
                </div>
              </> : null
          }
          <div
            onClick={() => {
              setTab('Preview')
            }}
            className={tab === 'Preview' ? 'Selected' : ""}
          >
            Preview
          </div>
          {
            data.layer_type === 'ARCGIS' ?
              <Fragment>
                <div
                  onClick={() => {
                    setTab('Fields')
                  }}
                  className={tab === 'Fields' ? 'Selected' : ""}
                >
                  Fields
                </div>
                <div
                  onClick={() => {
                    setTab('Label')
                  }}
                  className={tab === 'Label' ? 'Selected' : ""}
                >
                  Label
                </div>
              </Fragment> : ""
          }
        </div>
        <div id='ContextLayerConfig'
             className={"BasicFormSection " + (data.layer_type === 'ARCGIS' ? 'ShowStyle' : '')}>
          {
            tab === 'Preview' ?
              <div className='PreviewWrapper Preview'>
                <div className='legend'>
                  <div className='wrapper'>
                    <div className='title'>
                      <b className='light'>Legend</b>
                    </div>
                    {
                      legend ?
                        <div
                          dangerouslySetInnerHTML={{ __html: legend }}></div> : ""
                    }
                  </div>
                </div>
                <MapConfig
                  data={data}
                  layerInput={{
                    layer: layer,
                    layer_type: data.layer_type,
                    render: true
                  }}
                />
              </div> : ""
          }
          {
            ['Related Table', 'Vector Tile'].includes(data.layer_type) ? <>
              <div className='ArcgisConfig Style'>
                {
                  useOverride ?
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={data?.override_style ? data?.override_style : false}
                            onChange={evt => setData({
                              ...data,
                              styles: data.original_styles,
                              override_style: evt.target.checked
                            })}/>
                        }
                        label="Override style from default"/>
                    </FormGroup> : null
                }
                {
                  (!useOverride || data.override_style) ?
                    data.styles ?
                      <AggregationStyleConfig
                        data={data} setData={setData} setError={setError}
                      /> :
                      <div>Loading</div> : null
                }
              </div>
              <div className='ArcgisConfig Label form-helptext'>
                {data.layer_type} does not have label
              </div>
            </> : null
          }
          {
            data.layer_type === 'ARCGIS' ?
              <ArcgisConfig
                originalData={data} setData={setData}
                ArcgisData={layerData} useOverride={useOverride}
                useOverrideLabel={useOverrideLabel}
              /> : data.layer_type === 'Related Table' ?
                <RelatedTableConfig
                  originalData={data} setData={setData}
                  setError={setError}
                  RelatedTableData={layerData} useOverride={useOverride}
                  useOverrideLabel={useOverrideLabel}
                /> :
                <Fragment>
                  <div className='ArcgisConfig Fields form-helptext'>
                    Config is not Arcgis or Related Table Type
                  </div>
                </Fragment>
          }
          {children}
        </div>
      </div>
    </div>
  )
}