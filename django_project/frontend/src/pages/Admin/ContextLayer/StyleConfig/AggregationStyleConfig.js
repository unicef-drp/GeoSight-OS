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
import MapboxStyleInformation
  from "../../../../components/Buttons/MapboxStyleInformation";


export default function AggregationStyleConfig({ data, setData, setError }) {
  const [inputStyle, setInputStyle] = useState(null);

  useEffect(() => {
    if (!inputStyle) {
      setInputStyle(data.styles)
    }
  }, [data]);

  const {
    field_aggregation
  } = toJson(data.configuration);

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
     <MapboxStyleInformation inIcon={false}/>
    </span>
    <br/>
    <br/>
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
        setInputStyle(evt.target.value)
        try {
          setError(null)
          setData(
            {
              ...data,
              styles: evt.target.value,
              override_style: true
            }
          )
        } catch (e) {
          setError((e + '').split('at')[0])
        }
      }}/>
  </>
}