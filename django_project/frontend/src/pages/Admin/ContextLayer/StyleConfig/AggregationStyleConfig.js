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
 * __date__ = '14/06/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */


import React, { useEffect, useState } from "react";
import {
  defaultAggregationStyle,
  defaultPointStyle,
  defaultVectorTyleStyle
} from "./layerStyles";
import { toJson } from "../../../../utils/main";
import AggregationStyleGuide from "./AggregationStyleGuide";
import { v4 as uuidv4 } from "uuid";


export default function AggregationStyleConfig({ data, setData, setError }) {
  const [inputStyle, setInputStyle] = useState(null);

  useEffect(() => {
    if (data.styles !== inputStyle) {
      setInputStyle(data.styles)
    }
  }, [data]);

  const {
    field_aggregation
  } = toJson(data.configuration);

  const updateStyle = (newStyle) => {
    setInputStyle(newStyle)
    try {
      setError(null)
      setData(
        {
          ...data,
          styles: newStyle,
          override_style: true
        }
      )
    } catch (e) {
      setError((e + '').split('at')[0])
    }
  }
  return <>
    <div><b>Styles</b></div>
    {
      field_aggregation ?
        <AggregationStyleGuide data={data} styleChanged={val => {
          setInputStyle(val)
          setData(
            {
              ...data,
              styles: val,
              override_style: true
            }
          )
        }}/> : null
    }
    <span>
      Put layer list configurations with the mapbox format.<br/>
      Put source with "source" or any, it will automatically change to correct source.<br/>
      <a
        href="https://docs.mapbox.com/style-spec/reference/layers/"
        target="_blank">See documentation.</a>
    </span>
    <br/>
    <br/>
    {
      data.mapbox_style ?
        <div className='EditorButton' onClick={() => {
          let uuid = uuidv4();
          const _window = window.open('/cloud-native-gis/maputnik/', uuid, "popup=true");
          _window.inputStyle = JSON.stringify({
            ...data.mapbox_style,
            layers: inputStyle ? JSON.parse(inputStyle) : data.mapbox_style.layers
          })
          window.addEventListener('message', (event) => {
            if (event.source?.name === uuid) {
              const layers = event.data.layers.filter(layer => layer.id !== 'openstreetmap')
              updateStyle(JSON.stringify(layers, null, 4))
            }
          }, false);
        }}>
          Editor
        </div> : null
    }
    <textarea
      placeholder={
        JSON.stringify(field_aggregation ? defaultAggregationStyle : data.layer_type === 'Related Table' ?
            defaultPointStyle :
            defaultVectorTyleStyle,
          null, 4)
      }
      value={inputStyle}
      style={{ minHeight: "90%" }}
      onChange={(evt) => {
        updateStyle(evt.target.value)
      }}/>
  </>
}