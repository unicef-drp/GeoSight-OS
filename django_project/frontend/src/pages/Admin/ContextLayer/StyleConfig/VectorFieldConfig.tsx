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
 * __date__ = '12/04/2024'
 * __copyright__ = ('Copyright 2024, Unicef')
 */

/* ==========================================================================
   Vector fields config
   ========================================================================== */

import React, { Fragment } from "react";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { FieldAttribute } from "../../../../types/Field";
import FieldConfig from "../../../../components/FieldConfig";
import { DataField } from "../../../../types/IndicatorLayer";

/** Vector field config component. */

interface Props {
  originalData: DataField;
  setData: (data: DataField) => void;
  dataFields: FieldAttribute[];
  useOverride?: boolean;
}

export default function VectorFieldConfig({
  originalData,
  setData,
  dataFields,
  useOverride = false,
}: Props) {
  const data = JSON.parse(JSON.stringify(originalData));

  const update = () => {
    setData({ ...data });
  };
  return (
    <Fragment>
      <div className="ContextLayerConfig Fields">
        {useOverride ? (
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data?.override_field ? data?.override_field : false}
                  onChange={(evt) => {
                    setData({
                      ...data,
                      data_fields: dataFields,
                      override_field: evt.target.checked,
                    });
                  }}
                />
              }
              label="Override field config from default"
            />
          </FormGroup>
        ) : null}
        {!useOverride || data.override_field ? (
          data.data_fields ? (
            <Fragment>
              <div className="ContextLayerConfigFields">
                <FieldConfig
                  data_fields={data.data_fields}
                  update={(fields: DataField[]) => {
                    data.data_fields = fields;
                    update();
                  }}
                />
              </div>
            </Fragment>
          ) : (
            <div>Loading</div>
          )
        ) : null}
      </div>
    </Fragment>
  );
}
