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
import MapConfig from './Map'
import ArcgisConfig from './Arcgis'
import { useDispatch } from "react-redux";
import { getLayer } from '../../../Dashboard/LeftPanel/ContextLayers/Layer'

import './style.scss';


/**
 * Indicator Form App
 * @param {dict} data Data of context layer.
 * @param {boolean} checkConfig Checking config.
 */
export default function StyleConfig(
  { data, setData, useOverride = false, defaultTab = null }
) {
  const dispatch = useDispatch();
  const [layer, setLayer] = useState(null);
  const [error, setError] = useState(null);
  const [legend, setLegend] = useState(null);

  const [layerData, setLayerData] = useState(null);
  const [layerDataClass, setLayerDataClass] = useState(null);
  const [tab, setTab] = useState(data.layer_type === 'ARCGIS' ? 'Fields' : 'Map');

  useEffect(() => {
    if (defaultTab) {
      setTab(defaultTab)
    }
  }, [defaultTab]);

  useEffect(() => {
    setLayer(null)
    setError(null)
    setLegend(null)
    getLayer(data,
      (layer) => {
        setLayer(layer)
      },
      (legend) => {
        setLegend(legend)
      },
      async (error) => {
        if (data.arcgis_config && ['Token Required', 'Invalid Token'].includes(error)) {
          try {
            const response = await fetch(`/api/arcgis/${data.arcgis_config}/token`)
            const output = await response.json()
            setData({ ...data, token: output.result })
          } catch (error) {
            setError(error)
          }
        } else {
          setError(error)
        }
      }, dispatch, (output) => {
        setLayerDataClass(output)
      });
  }, [data, tab]);

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
          <div
            onClick={() => {
              setTab('Map')
            }}
            className={tab === 'Map' ? 'Selected' : ""}
          >
            Map
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
                <div
                  onClick={() => {
                    setTab('Style')
                  }}
                  className={tab === 'Style' ? 'Selected' : ""}
                >
                  Style
                </div>
              </Fragment> : ""
          }
        </div>
        <div id='ContextLayerConfig' className="BasicFormSection">
          {
            tab === 'Map' ?
              <div className='MapWrapper Map'>
                <div className='legend'>
                  <div className='title'><b className='light'>Legend</b></div>
                  {
                    legend ?
                      <div
                        dangerouslySetInnerHTML={{ __html: legend }}></div> : ""
                  }
                </div>
                <MapConfig data={data} layerInput={{
                  layer: layer,
                  layer_type: data.layer_type,
                  render: true
                }}/>
              </div> : ""
          }
          {
            data.layer_type === 'ARCGIS' ?
              <ArcgisConfig
                originalData={data} setData={setData}
                ArcgisData={layerData} useOverride={useOverride}
              /> :
              <Fragment>
                <div className='ArcgisConfig Fields form-helptext'>
                  Config is not Arcgis
                </div>
                <div className='ArcgisConfig Style form-helptext'>
                  Config is not Arcgis
                </div>
              </Fragment>
          }
        </div>
      </div>
    </div>
  )
}