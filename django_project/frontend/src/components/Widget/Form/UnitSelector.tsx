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
 * __date__ = '19/08/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React from "react";
import { useSelector } from "react-redux";
import { FormControl, Radio } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import MultiSelectorConfig from "../../../pages/Admin/Components/Input/MultiSelector";
import ColorPaletteSelector from "../../Input/ColorPaletteSelector";
import { UnitConfig } from "../../../types/Widget";
import { SeriesDataType, SeriesType } from "../Definition";
import { Indicator } from "../../../types/Indicator";

export interface Props {
  type: string;
  setType: (type: string) => void;
  selectedList: UnitConfig[];
  setSelectedList: (items: UnitConfig[]) => void;
  colorPalette: number;
  setColorPalette: (colorPalette: number) => void;
  useColorPalette: boolean;
}

export interface DataSeriesConfigChild extends Props {
  seriesType: string;
}

export interface DataSeriesConfig extends Props {
  name: string;
  list: string[];
  enabled: boolean;
}

export function DataSeriesConfig({
  name,
  enabled,
  type,
  setType,
  list,
  selectedList,
  setSelectedList,
  colorPalette,
  setColorPalette,
  useColorPalette,
}: DataSeriesConfig) {
  return (
    <FormControl className="MuiForm-RadioGroup">
      <FormLabel className="MuiInputLabel-root">{name}</FormLabel>
      <RadioGroup
        className="Horizontal"
        value={type}
        onChange={(evt) => {
          setType(evt.target.value);
        }}
      >
        {Object.keys(SeriesDataType).map((key) => {
          return (
            <FormControlLabel
              key={key}
              control={<Radio />}
              /* @ts-ignore*/
              value={SeriesDataType[key]}
              /* @ts-ignore*/
              label={SeriesDataType[key]}
            />
          );
        })}
      </RadioGroup>
      {type === SeriesDataType.PREDEFINED ? (
        <MultiSelectorConfig
          /* @ts-ignore*/
          className={"MuiForm-SubGroup"}
          items={list}
          selectedItems={selectedList}
          setSelectedItems={(items: any) => {
            setSelectedList(items);
          }}
          configEnabled={enabled}
          noColor={!useColorPalette}
        />
      ) : enabled && useColorPalette ? (
        <div className="MuiForm-SubGroup">
          {/* TODO: We need to move color palette to tsx */}
          {/* @ts-ignore*/}
          <ColorPaletteSelector
            colorPalette={colorPalette}
            onChange={(val: number) => {
              setColorPalette(val);
            }}
            isDisabled={!enabled}
            keepData={true}
          />
        </div>
      ) : null}
    </FormControl>
  );
}

export function IndicatorDataSeriesConfig({
  seriesType,
  type,
  setType,
  selectedList,
  setSelectedList,
  colorPalette,
  setColorPalette,
  useColorPalette,
}: DataSeriesConfigChild) {
  const { indicators, indicatorLayers } = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data,
  );

  const indicatorListConfig: any = [];
  indicators.map((indicator: Indicator) => {
    indicatorListConfig.push({
      id: indicator.id,
      name: indicator.name,
    });
  });
  // TODO:
  //  We need to fix this
  // indicatorLayersLikeIndicator(indicatorLayers).map(
  //   (indicatorLayer: IndicatorLayer) => {
  //     indicatorListConfig.push({
  //       id: indicatorLayerId(indicatorLayer),
  //       name: indicatorLayer.name,
  //     });
  //   },
  // );
  return (
    <DataSeriesConfig
      name={"Indicators"}
      enabled={seriesType === SeriesType.INDICATORS}
      type={type}
      setType={setType}
      list={indicatorListConfig}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      colorPalette={colorPalette}
      setColorPalette={setColorPalette}
      useColorPalette={useColorPalette}
    />
  );
}

export function GeographyUnitSeriesConfig({
  seriesType,
  type,
  setType,
  selectedList,
  setSelectedList,
  colorPalette,
  setColorPalette,
  useColorPalette,
}: DataSeriesConfigChild) {
  /** States of dashboard **/
  const { referenceLayer } =
    // @ts-ignore
    useSelector((state) => state.dashboard.data);
  const geometries = useSelector(
    // @ts-ignore
    (state) => state.datasetGeometries[referenceLayer.identifier],
  );

  // This is for configurations
  const geometryList: any = [];
  Object.keys(geometries).map((level) =>
    Object.keys(geometries[level]).map((concept_uuid) => {
      const geom = geometries[level][concept_uuid];
      geometryList.push({
        id: concept_uuid,
        name: geom.name + ` (${geom.ucode})`,
      });
    }),
  );
  return (
    <DataSeriesConfig
      name={"Geographical units"}
      enabled={seriesType === SeriesType.GEOGRAPHICAL_UNITS}
      type={type}
      setType={setType}
      list={geometryList}
      selectedList={selectedList}
      setSelectedList={setSelectedList}
      colorPalette={colorPalette}
      setColorPalette={setColorPalette}
      useColorPalette={useColorPalette}
    />
  );
}
