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
 * __author__ = 'fpsampayo@geomatico.es'
 * __date__ = '31/10/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

import React, {Fragment, useEffect, useState, useMemo} from 'react';
import { debounce } from '@mui/material/utils';
import {FormControl} from "@mui/material";
import ColorPaletteStyleConfig, {QUANTITATIVE_TYPE} from "../../../Style/Form/DynamicStyleConfig/Palette";
import {dictDeepCopy} from "../../../../../utils/main";
import {dynamicClassificationChoices} from "../../../Style/Form/DynamicStyleConfig";
import ColorSelector from "../../../../../components/Input/ColorSelector";




const constructStyle = (styles) => {
    let newStyles = styles
    if (!styles) {
      newStyles = {}
    }
    if (newStyles.min_band === undefined) {
      newStyles.min_band = 0;
    }
    if (newStyles.max_band === undefined) {
      newStyles.max_band = 100;
    }
    if (newStyles.dynamic_class_num === undefined) {
      newStyles.dynamic_class_num = 7;
    }
    if (newStyles.dynamic_classification === undefined) {
      newStyles.dynamic_classification = dynamicClassificationChoices[0].value;
    }
    if (newStyles.additional_nodata === undefined) {
      newStyles.additional_nodata = null;
    }
    if (newStyles.nodata_color === undefined) {
      newStyles.nodata_color = '#000000';
    }
    if (newStyles.nodata_opacity === undefined) {
      newStyles.nodata_opacity = 0;
    }

    return newStyles
}


/**
 * Map Config component.
 */
export default function RasterCogLayer(
  {
    data, setData, useOverride
  }
) {
  const newData = dictDeepCopy(data);
  const styles = constructStyle(newData.styles);
  const [noDataColor, setNoDataColor] = useState(styles.nodata_color);

  useEffect(() => {
    console.log('update color')
    console.log({
      ...data,
      styles: {
        ...styles,
        nodata_color: noDataColor
      }
    })
    setData({
      ...data,
      styles: {
        ...styles,
        nodata_color: noDataColor
      }
    })
  }, [noDataColor]);

  const [value, setValue] = useState(styles);
  const [typedValue, setTypedValue] = useState(value);

  useEffect(() => {

  }, [styles]);

  const valueUpdate = useMemo(
    () =>
      debounce(
        (newValue) => {
          setValue(newValue)
        },
        400
      ),
    []
  );

  /** Searched project changed **/
  useEffect(() => {
    valueUpdate(typedValue)
  }, [typedValue]);

  return <>
    <label className="form-label required" htmlFor="group">
      Band values
    </label>
    <FormControl
      className="BasicFormSection">
      <input
        placeholder='Minimum band' type='number'
        value={styles.min_band}
        onChange={evt => {
          setData({
            ...data,
            styles: {
              ...styles,
              min_band: evt.target.value
            }
          })
        }}
        style={{width: "fit-content", flexGrow: 1}}
      />
      <span> - </span>
      <input
        placeholder='Maximum band' type='number'
        value={styles.max_band}
        onChange={evt => {
          setData({
            ...data,
            styles: {
              ...styles,
              max_band: evt.target.value
            }
          })
        }}
        style={{width: "fit-content", flexGrow: 1}}
      />
      <br/>
      <br/>
      <div>
        <div className="BasicFormSection">
          <div className='RuleTable-Title'>NoData Value</div>
          <input
            placeholder='NoData Value' type='text'
            value={styles.nodata}
            disabled={true}
            style={{width: "fit-content", flexGrow: 1}}
          />
        </div>
        <div className="BasicFormSection">
          <div className='RuleTable-Title'>Additional NoData Value</div>
          <input
            placeholder='Additional NoData Value' type='number'
            value={styles.additional_nodata}
            onChange={evt => {
              setData({
                ...data,
                styles: {
                  ...styles,
                  additional_nodata: evt.target.value
                }
              })
            }}
            style={{width: "fit-content", flexGrow: 1}}
          />
        </div>
        <div className="BasicFormSection">
          <div className='RuleTable-Title'>NoData Color</div>
          <ColorSelector
            // color={styles.nodata_color ? styles.nodata_color : '#000000'}
            color={noDataColor}
            onChange={evt => {
              setNoDataColor(evt.target.value)
            }}
            hideInput={true}
            fullWidth={true}
          />
        </div>
        <div className="BasicFormSection">
          <div className='RuleTable-Title'>NoData Opacity (0-100)</div>
          <input
            placeholder='NoData Opacity' type='number'
            value={styles.nodata_opacity}
            onChange={evt => {
              setData({
                ...data,
                styles: {
                  ...styles,
                  nodata_opacity: parseFloat(evt.target.value)
                }
              })
            }}
            style={{width: "fit-content", flexGrow: 1}}
          />
        </div>
      </div>
      {/*  Palette */}
      <ColorPaletteStyleConfig
        styleType={QUANTITATIVE_TYPE}
        styleConfig={styles ? styles : {}}
        setStyleConfig={
          (newStyles) => {
            setData({
              ...data,
              styles: {
                ...styles,
                ...newStyles
              }
            })
          }
        }
        options={
          [
            {
              label: dynamicClassificationChoices[0].label.replace('.', ''),
              value: dynamicClassificationChoices[0].value,
            }
          ]
        }
      />
    </FormControl>
  </>
}
