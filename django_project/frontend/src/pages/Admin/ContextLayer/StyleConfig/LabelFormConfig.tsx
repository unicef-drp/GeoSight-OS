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

import React from "react";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import LabelStyle from "../../LabelStyle";
import TextField from "@mui/material/TextField";
import {
  ContextLayer,
  ContextLayerDataField,
} from "../../../../types/ContextLayer";
import { Variables } from "../../../../utils/Variables";

interface Props {
  originalData: ContextLayer;
  setOriginalData: (data: ContextLayer) => void;
  useOverride: boolean;
}

/*** Label section ***/
export default function LabelFormConfig({
  originalData,
  setOriginalData,
  useOverride,
}: Props) {
  const data = JSON.parse(JSON.stringify(originalData));
  if (!Variables.LAYER.LIST.VECTOR_TILE_TYPES.includes(data.layer_type)) {
    return null;
  }

  const setData = (data: ContextLayer) => {
    setOriginalData({ ...data });
  };

  return (
    <div className="ArcgisConfig Label">
      {useOverride ? (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={data?.override_label ? data?.override_label : false}
                onChange={(evt) =>
                  setData({
                    ...data,
                    label_styles: null,
                    override_label: evt.target.checked,
                  })
                }
              />
            }
            label="Override label config from context layer"
          />
        </FormGroup>
      ) : null}
      {(!useOverride || data.override_label) && data.data_fields && (
        <>
          <LabelStyle
            key={data.id}
            label_styles={data.label_config?.style}
            update={(label_styles: any) => {
              if (!data.label_config) {
                data.label_config = {
                  text: "",
                };
              }
              data.label_config = {
                ...data.label_config,
                style: label_styles,
              };
              setData({ ...data });
            }}
          />
          <div className="BasicFormSection"></div>
          <div className="BasicFormSection">
            <label className="form-label">Text</label>
            <TextField
              multiline={true}
              value={data.label_config?.text ? data.label_config?.text : ""}
              onChange={(evt) => {
                if (!data.label_config) {
                  data.label_config = {};
                }
                data.label_config = {
                  ...data.label_config,
                  text: evt.target.value,
                };
                console.log(data);
                setData({ ...data });
              }}
            />
            <span className="form-helptext">
              {
                "To put the value of a field, you can put markup {'<Field Name>'}."
              }
              <br />
              The field name that can be used are:&nbsp;
              {data.data_fields
                .map((field: ContextLayerDataField) => field.name)
                .join(", ")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
