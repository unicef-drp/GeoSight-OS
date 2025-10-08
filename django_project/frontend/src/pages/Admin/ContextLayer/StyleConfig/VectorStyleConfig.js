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
import { capitalize, dictDeepCopy, toJson } from "../../../../utils/main";
import AggregationStyleGuide from "./AggregationStyleGuide";
import { updateDataWithMapbox } from "../../../../utils/CloudNativeGIS";
import MapboxStyleInformation from "../../../../components/Buttons/MapboxStyleInformation";
import { Editor } from "../../../../components/MapBoxStyleEditor";
import { Variables } from "../../../../utils/Variables";

export default function VectorStyleConfig({ data, setData, setError }) {
  const [inputStyle, setInputStyle] = useState(null);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (data.styles !== inputStyle) {
      if (typeof data.styles !== "string") {
        setInputStyle(JSON.stringify(data.styles, null, 4));
      } else {
        setInputStyle(data.styles);
      }

      // --------------------------------------------
      // Fetch the attributes
      // --------------------------------------------
      if (data.layer_type === Variables.LAYER.TYPE.RELATED_TABLE) {
        if (data.related_table) {
          setFields(null);
          (async () => {
            try {
              const response = await fetch(
                `/api/v1/related-tables/${data.related_table}/`,
              );

              if (!response.ok) {
                setFields([]);
              }
              const jsonData = await response.json();
              setFields(jsonData.fields_definition);
            } catch (error) {
              setFields([]);
            }
          })();
        }
      }
      if (data.layer_type === Variables.LAYER.TYPE.CLOUD_NATIVE_GIS) {
        if (data.cloud_native_gis_layer_id) {
          setFields(null);
          (async () => {
            try {
              const response = await fetch(
                `/cloud-native-gis/api/layer/${data.cloud_native_gis_layer_id}/attributes/`,
              );

              if (!response.ok) {
                setFields([]);
              }
              const jsonData = await response.json();
              const fields = jsonData.results.map((field) => {
                return {
                  name: field.attribute_name,
                  label: field.attribute_label
                    ? field.attribute_label
                    : capitalize(field.attribute_name),
                  type:
                    field.attribute_type.includes("int") ||
                    field.attribute_type.includes("double")
                      ? "number"
                      : field.attribute_type.includes("timestamp")
                        ? "date"
                        : "string",
                };
              });
              setFields(fields);
            } catch (error) {
              setFields([]);
            }
          })();
        }
      }
      // --------------------------------------------
    }
    if (data.cloud_native_gis_layer_id && !data.mapbox_style) {
      (async () => {
        const newData = await updateDataWithMapbox(data);
        if (data.last_update) {
          newData.styles = JSON.stringify(newData.mapbox_style.layers, null, 4);
        }
        setData(newData);
      })();
    }
  }, [data]);

  const { field_aggregation } = toJson(data.configuration);

  const layers = inputStyle?.length
    ? JSON.parse(inputStyle)
    : data.mapbox_style?.layers;

  const updateStyle = (newStyle) => {
    if (newStyle === JSON.stringify(layers)) return;
    setInputStyle(newStyle);
    try {
      setError(null);
      setData({
        ...data,
        styles: newStyle,
        override_style: true,
      });
    } catch (e) {
      setError((e + "").split("at")[0]);
    }
  };

  if (fields === null) {
    return <div>Loading attributes...</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div>
        <div>
          <b>Styles</b>
        </div>
        {field_aggregation ? (
          <AggregationStyleGuide
            styleChanged={(val) => {
              setInputStyle(val);
              setData({
                ...data,
                styles: val,
                override_style: true,
              });
            }}
          />
        ) : null}
        <span>
          Put layer list configurations with the mapbox format.
          <br />
          Put source with "source" or any, it will automatically change to
          correct source.
          <br />
          <MapboxStyleInformation inIcon={false} />
        </span>
        <br />
        <br />
      </div>
      <Editor
        layers={dictDeepCopy(layers)}
        setLayers={(_layers) => {
          updateStyle(JSON.stringify(_layers));
        }}
        source={data.mapbox_style?.sources}
        sourceLayer={
          data.type === Variables.LAYER.TYPE.CLOUD_NATIVE_GIS ? "default" : null
        }
        fields={fields}
      />
    </div>
  );
}
