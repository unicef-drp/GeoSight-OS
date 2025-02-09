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

import React, {Fragment, useEffect, useRef, useState} from 'react';
import { Checkbox, FormControlLabel, FormGroup, Modal, Typography, Box, CircularProgress } from "@mui/material";
import MapConfig from './Map'
import ArcgisConfig from './Arcgis'
import { useDispatch } from "react-redux";
import {
  getLayer
} from '../../../Dashboard/MapLibre/Layers/ContextLayers/Layer'
import { defaultPointStyle } from './layerStyles';
import RelatedTableConfig from './RelatedTable';
import VectorStyleConfig from "./VectorStyleConfig";
import { Variables } from "../../../../utils/Variables";
import RasterCogLayer from "./RasterCogLayer";

import './style.scss';

const SelectedClass = 'Selected';

// TAB value
const GENERAL = 'General';
const FIELDS = 'Fields';
const PREVIEW = 'Preview';
const LABEL = 'Label';

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
  const [isMapLoading, setIsMapLoading] = useState(false);
  const requestSent = useRef(false);
  const [tab, setTab] = useState(data.layer_type === Variables.LAYER.TYPE.ARCGIS ? FIELDS : PREVIEW);

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
    if (!data.styles && Variables.LAYER.LIST.VECTOR_TILE_TYPES.includes(data.layer_type)) {
      setData({
        ...data,
        styles: JSON.stringify(defaultPointStyle, null, 4),
        override_style: true
      })
    } else if (data.styles?.min_band === undefined && Variables.LAYER.TYPE.RASTER_COG === data.layer_type) {
      setData({
        ...data,
        styles: {},
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
      {error && <div className='error'>{error.toString()}</div>}
      <div className='AdminForm'>
        {/* FOR CONFIG */}
        <div className='TabPrimary ContextLayerConfigTab'>
          {
            data.layer_type === Variables.LAYER.TYPE.RELATED_TABLE ?
              <div
                onClick={() => setTab('General_Override')}
                className={tab === GENERAL ? SelectedClass : ""}
              >
                General
              </div> : null
          }
          <div
            onClick={() => setTab(PREVIEW)}
            className={tab === PREVIEW ? SelectedClass : ""}
          >
            Preview
          </div>
          {
            data.layer_type === Variables.LAYER.TYPE.ARCGIS ?
              <Fragment>
                <div
                  onClick={() => setTab(FIELDS)}
                  className={tab === FIELDS ? SelectedClass : ""}
                >
                  Fields
                </div>
                <div
                  onClick={() => setTab(LABEL)}
                  className={tab === LABEL ? SelectedClass : ""}
                >
                  Label
                </div>
              </Fragment> : ""
          }
        </div>
        {
          isMapLoading && data.layer_type === Variables.LAYER.TYPE.RASTER_COG &&
            <Modal
              id={'Modal-Loading-Style-Config'}
              open={true}
            >
              <Box>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Getting color classification from API.
                </Typography>
                <CircularProgress/>
              </Box>
            </Modal>
        }
        <div id='ContextLayerConfig'
             className={"BasicFormSection " + (data.layer_type === Variables.LAYER.TYPE.ARCGIS ? 'ShowStyle' : '')}
        >
          {
            tab === PREVIEW ?
              <div className='PreviewWrapper Preview'>
                <div className='legend'>
                  <div className='wrapper'>
                    <div className='title'>
                      <b className='light'>Legend</b>
                    </div>
                    {
                      legend &&
                      <div dangerouslySetInnerHTML={{ __html: legend }}></div>
                    }
                  </div>
                </div>
                <MapConfig
                  data={data}
                  setData={setData}
                  layerInput={{
                    layer: layer,
                    layer_type: data.layer_type,
                    render: true
                  }}
                  setLoading={setIsMapLoading}
                />
              </div> : null
          }

          {/* For STYLES */}
          {
            (
              Variables.LAYER.LIST.VECTOR_TILE_TYPES.includes(data.layer_type) ||
              data.layer_type === Variables.LAYER.TYPE.RASTER_COG
            ) ? <>
              {/* Check if override or not. */}
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

                {/* If vector tile */}
                {
                  Variables.LAYER.LIST.VECTOR_TILE_TYPES.includes(data.layer_type) && (!useOverride || data.override_style) ?
                    data.styles ?
                      <VectorStyleConfig
                        data={data} setData={setData} setError={setError}
                      /> :
                      <div>Loading</div> : null
                }

                {/* If raster cog */}
                {
                  data.layer_type === Variables.LAYER.TYPE.RASTER_COG && (!useOverride || data.override_style) ?
                    <RasterCogLayer
                      data={data} setData={setData}
                      useOverride={useOverride}
                    /> : null
                }
              </div>
            </> : null
          }

          {/* For LABEL */}
          {
            (
              Variables.LAYER.LIST.VECTOR_TILE_TYPES.includes(data.layer_type) ||
              data.layer_type === Variables.LAYER.TYPE.RASTER_COG
            ) &&
            <div className='ArcgisConfig Label form-helptext'>
              {data.layer_type} does not have label
            </div>
          }

          {/* For FIELDS */}
          {
            data.layer_type === Variables.LAYER.TYPE.ARCGIS ?
              <ArcgisConfig
                originalData={data} setData={setData}
                ArcgisData={layerData} useOverride={useOverride}
                useOverrideLabel={useOverrideLabel}
              /> : data.layer_type === Variables.LAYER.TYPE.RELATED_TABLE ?
                <RelatedTableConfig
                  originalData={data} setData={setData}
                  setError={setError}
                  RelatedTableData={layerData} useOverride={true}
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