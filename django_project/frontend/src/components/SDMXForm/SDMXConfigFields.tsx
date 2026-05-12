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
 * __date__ = '07/05/2026'
 * __copyright__ = ('Copyright 2026, Unicef')
 */
import React from "react";

import {
  SMDXAgencySelector,
  SMDXDataFlowSelector,
  SMDXDataFlowVersionSelector,
} from "./DropdownInput";
import { SDMXConfig, SDMXDataForm } from "../../types/SDMX";

interface Props {
  sdmxConfig: SDMXConfig | null;
  data: SDMXDataForm;
  onChange: (data: SDMXDataForm) => void;
}

const SDMXConfigFields = ({ sdmxConfig, data, onChange }: Props) => {
  return (
    <>
      <section className="BasicFormSection">
        <label className="form-label required">SDMX Base Url</label>
        <div style={{ display: "flex" }}>
          <input
            style={{ flexGrow: 1, width: "unset" }}
            type="text"
            disabled={true}
            className="form-control"
            value={sdmxConfig?.url ?? ""}
            placeholder="https://..."
            onChange={() => {}}
          />
        </div>
      </section>

      <SMDXAgencySelector
        sdmxConfig={sdmxConfig}
        selectedValue={data.agencyId}
        onChangeValue={() => {}}
        onChangeAgency={(value, name) => {
          if (value === null || value === data.agencyId) {
            if (!data.agencyName) {
              onChange({
                ...data,
                agencyName: name,
              });
            }
            return;
          }
          onChange({
            ...data,
            url: null,
            agencyId: value,
            agencyName: name,
            dataflowId: null,
            dataflowDsdId: null,
            dataflowName: null,
            dataflowVersionId: null,
          });
        }}
        disabled={!(sdmxConfig && data.smdxConfigId)}
      />

      <SMDXDataFlowSelector
        sdmxDataForm={data}
        sdmxConfig={sdmxConfig}
        selectedValue={data.dataflowId}
        onChangeValue={() => {}}
        onChangeDataFlow={(value, dsdId, name) => {
          if (value === null || value === data.dataflowId) {
            if (!data.dataflowName) {
              onChange({
                ...data,
                dataflowDsdId: dsdId,
                dataflowName: name,
              });
            }
            return;
          }
          onChange({
            ...data,
            url: null,
            dataflowId: value,
            dataflowDsdId: dsdId,
            dataflowName: name,
            dataflowVersionId: null,
          });
        }}
        disabled={!(sdmxConfig && data.agencyId)}
      />

      <SMDXDataFlowVersionSelector
        sdmxDataForm={data}
        sdmxConfig={sdmxConfig}
        selectedValue={data.dataflowVersionId}
        onChangeValue={(value) => {
          if (value === null || value === data.dataflowVersionId) return;
          onChange({ ...data, url: null, dataflowVersionId: value });
        }}
        disabled={!(sdmxConfig && data.dataflowId)}
      />
    </>
  );
};

export default SDMXConfigFields;
