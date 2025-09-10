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
 * __date__ = '09/09/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import { IndicatorLayer } from "../../../../types/IndicatorLayer";
import { useSelector } from "react-redux";
import { CompositeIndexLayerConfigIndicatorLayer } from "../variable";
import { Checkbox } from "@mui/material";
import DoDisturbOnIcon from "@mui/icons-material/DoDisturbOn";
import { isEligibleForCompositeLayer } from "../utilities";

export interface NewIndicatorLayerSelectorProps {
  ids: string[];
  onSelected: (id: number) => void;
}

export function NewIndicatorLayerSelector({
  ids,
  onSelected,
}: NewIndicatorLayerSelectorProps) {
  const indicatorLayers = useSelector((state) => {
    // @ts-ignore
    return state.dashboard.data.indicatorLayers.filter(
      (indicatorLayer: IndicatorLayer) =>
        isEligibleForCompositeLayer(indicatorLayer) &&
        !ids.includes(indicatorLayer.id.toString()),
    );
  });
  const handleNewIndicatorChange = (event: any) => {
    const selected = event.target.value;
    onSelected(selected);
  };
  return (
    <select
      value={""}
      onChange={handleNewIndicatorChange}
      style={{ cursor: "pointer" }}
    >
      <option value="" disabled>
        + Add indicator
      </option>
      {indicatorLayers.map((indicatorLayer: IndicatorLayer) => (
        <option value={indicatorLayer.id}>{indicatorLayer.name}</option>
      ))}
    </select>
  );
}

export interface RowProps {
  layer: CompositeIndexLayerConfigIndicatorLayer;
  setLayer: (data: CompositeIndexLayerConfigIndicatorLayer) => void;
  totalWeight: number;
  onDelete: () => void;
}

export function Row({ layer, setLayer, totalWeight, onDelete }: RowProps) {
  const indicatorLayer = useSelector((state) => {
    // @ts-ignore
    return state.dashboard.data.indicatorLayers.find(
      (indicatorLayer: IndicatorLayer) =>
        indicatorLayer.id.toString() === layer.id.toString(),
    );
  });
  if (!indicatorLayer) return null;
  return (
    <tr>
      <td>{indicatorLayer.name}</td>
      <td>
        <input
          value={layer.weight}
          onChange={(event) => {
            setLayer({ ...layer, weight: parseFloat(event.target.value) });
          }}
          type="number"
          min={1}
        />
      </td>
      <td>{((layer.weight / totalWeight) * 100).toFixed(0)}%</td>
      <td>
        <Checkbox
          checked={layer.invert}
          onClick={(e) => {
            setLayer({ ...layer, invert: !layer.invert });
          }}
        />
      </td>
      <td>
        <DoDisturbOnIcon className="error" onClick={onDelete} />
      </td>
    </tr>
  );
}

export interface Props {
  data: IndicatorLayer;
  setData: (data: IndicatorLayer) => void;
}

export function GeneralForm({ data, setData }: Props) {
  const totalWeight =
    data.config?.indicatorLayers.reduce(
      (sum: number, layer: any) => sum + (layer.weight || 0),
      0,
    ) || 0;
  return (
    <div>
      <div className="BasicFormSection">
        <div>
          <label className="form-label required">Name</label>
        </div>
        <div className="ContextLayerConfig-IconSize">
          <input
            type="text"
            spellCheck="false"
            value={data.name}
            onChange={(evt) => {
              data.name = evt.target.value;
              setData({ ...data });
            }}
          />
        </div>
      </div>
      <div className="BasicFormSection">
        <div>
          <label className="form-label">Description</label>
        </div>
        <div className="ContextLayerConfig-IconSize">
          <textarea
            value={data.description}
            onChange={(evt) => {
              data.description = evt.target.value;
              setData({ ...data });
            }}
          />
        </div>
      </div>
      <div className="BasicFormSection">
        <table className="MainTable">
          <thead>
            <tr>
              <th>Selected Indicators</th>
              <th>Weight</th>
              <th>percentage (%)</th>
              <th>Invert</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {data.config?.indicatorLayers.map((layer: any) => (
              <Row
                key={layer.id}
                layer={layer}
                setLayer={(
                  newLayer: CompositeIndexLayerConfigIndicatorLayer,
                ) => {
                  data.config.indicatorLayers = data.config.indicatorLayers.map(
                    (layer: any) =>
                      layer.id === newLayer.id ? newLayer : layer,
                  );
                  setData({ ...data });
                }}
                totalWeight={totalWeight}
                onDelete={() => {
                  data.config.indicatorLayers =
                    data.config.indicatorLayers.filter(
                      (newLayer: any) => newLayer.id !== layer.id,
                    );
                  setData({ ...data });
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="BasicFormSection">
        <NewIndicatorLayerSelector
          ids={data.config?.indicatorLayers.map((layer: any) =>
            layer.id.toString(),
          )}
          onSelected={(layerId) => {
            data.config.indicatorLayers.push({
              id: layerId,
              weight: 1,
              invert: false,
            });
            setData({ ...data });
          }}
        />
      </div>
    </div>
  );
}
