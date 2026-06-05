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

/* ==========================================================================
   BASEMAPS SELECTOR
   ========================================================================== */

import React, { Fragment } from "react";
import $ from "jquery";
import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import { indicatorLayerStyle } from "../../../../utils/Style";
import { dictDeepCopy } from "../../../../utils/main";
import {
  getLayerData,
  indicatorHasData,
} from "../../../../utils/indicatorLayer";
import { allDataIsReady } from "../../../../utils/indicators";
import { LayerIcon } from "../../../../components/Icons";
import { IndicatorLayer } from "../../../../types/IndicatorLayer";
import { Indicator } from "../../../../types/Indicator";
import { Plugin, PluginChild } from "../utils/Plugin";

import "./style.scss";

/** Render indicator legend section */
const RenderIndicatorLegendSection = ({
  rules,
  name,
}: {
  rules: any;
  name: string;
}) => {
  return (
    <div className="MapLegendSection">
      <div className="MapLegendSectionTitle">{name}</div>
      {![null, undefined].includes(rules) ? (
        <Fragment>
          {rules.length ? (
            <div className="IndicatorLegendSection">
              {rules.map((rule: any) => {
                const border = `1px solid ${rule.outline_color}`;
                return (
                  <div className="IndicatorLegendRow">
                    <div
                      className="IndicatorLegendRowBlock"
                      style={{
                        backgroundColor: rule.color,
                        border: border,
                      }}
                    ></div>
                    <div className="IndicatorLegendRowName" title={rule.name}>
                      {rule.name}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Fragment>
      ) : (
        <div className="Throbber">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};
/**
 * Render indicator legend
 */
const RenderIndicatorLegend = ({
  layer,
  name,
}: {
  layer: IndicatorLayer;
  name: string;
}) => {
  const referenceLayer = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.referenceLayer,
  );
  // @ts-ignore
  const indicators = useSelector((state) => state.dashboard.data?.indicators);
  // @ts-ignore
  const geoField = useSelector((state) => state.dashboard.data?.geoField);
  // @ts-ignore
  const selectedGlobalTime = useSelector((state) => state.selectedGlobalTime);
  // @ts-ignore
  const selectedAdminLevel = useSelector((state) => state.selectedAdminLevel);
  // @ts-ignore
  const indicatorsData = useSelector((state) => state.indicatorsData);
  // @ts-ignore
  const relatedTableData = useSelector((state) => state.relatedTableData);
  // @ts-ignore
  const filteredGeometries = useSelector((state) => state.filteredGeometries);
  // @ts-ignore
  const indicatorLayersData = useSelector((state) => state.indicatorLayersData);

  if (layer.multi_indicator_mode === "Pin") {
    return layer.indicators.map((indicator) => {
      const hasData = indicatorHasData(indicatorsData, indicator);
      let rules = null;
      if (hasData) {
        let indicatorData = indicator;
        // @ts-ignore
        if (!indicator.style) {
          const obj = indicators.find(
            (ind: Indicator) => ind.id === indicator.id,
          );
          if (obj) {
            indicatorData = dictDeepCopy(obj);
            // @ts-ignore
            indicatorData.indicators = [indicator];
          }
        }
        rules = indicatorLayerStyle(
          {
            ...layer,
            indicators: [indicator],
          },
          indicators,
          indicatorsData,
          relatedTableData,
          selectedGlobalTime,
          geoField,
          selectedAdminLevel?.level,
          filteredGeometries,
          indicatorData,
          referenceLayer,
        );
      }
      return (
        <RenderIndicatorLegendSection rules={rules} name={indicator.name} />
      );
    });
  }
  const layerData = getLayerData(
    indicatorsData,
    relatedTableData,
    layer,
    referenceLayer,
    false,
    indicatorLayersData,
  );
  const hasData = allDataIsReady(layerData);
  let rules = null;
  if (hasData) {
    rules = indicatorLayerStyle(
      layer,
      indicators,
      indicatorsData,
      relatedTableData,
      selectedGlobalTime,
      geoField,
      selectedAdminLevel?.level,
      filteredGeometries,
      null,
      referenceLayer,
      indicatorLayersData,
    );
  }
  return <RenderIndicatorLegendSection rules={rules} name={name} />;
};

export interface Props {
  firstLayer: IndicatorLayer;
  secondLayer: IndicatorLayer;
}

/** Map Legend. */
export default function MapLegend({ firstLayer, secondLayer }: Props) {
  // @ts-ignore
  const compareMode = useSelector((state) => state.mapMode?.compareMode);
  // @ts-ignore
  const indicatorShow = useSelector((state) => state.map?.indicatorShow);

  return (
    <>
      <div className="MapLegend">
        <div className="MapLegendContent Fullscreen">
          {firstLayer.id && indicatorShow && (
            <RenderIndicatorLegend
              layer={firstLayer}
              name={firstLayer.name + (compareMode ? " (Outline)" : "")}
            />
          )}
          {secondLayer.id && indicatorShow && (
            <RenderIndicatorLegend
              layer={secondLayer}
              name={secondLayer.name + " (Inner)"}
            />
          )}
        </div>
      </div>
      <Plugin
        className="LegendToggler Mobile"
        onClick={(_: any) => {
          $("html").toggleClass("MapLegendOpen");
        }}
      >
        <PluginChild title={"Legend"} disabled={false} active={true}>
          <LayerIcon />
        </PluginChild>
      </Plugin>
    </>
  );
}
