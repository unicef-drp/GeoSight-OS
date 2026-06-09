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
import { useDispatch, useSelector } from "react-redux";
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
import { Select } from "../../../../components/Input";
import { getIndicatorLayersOptions } from "../../../../selectors/dashboard";
import {
  selectIndicatorLayerIds
} from "../../../../selectors/indicatorLayers";
import { Actions } from "../../../../store/dashboard";
import { MapLegendSwitcher } from "../MapSwitcher";

import "./style.scss";

const RenderIndicatorLegendName = ({ layer }: { layer: IndicatorLayer }) => {
  const dispatch = useDispatch();
  // @ts-ignore
  const compareMode = useSelector((state) => state.mapMode?.compareMode);
  const indicatorLayerIds = useSelector(selectIndicatorLayerIds);
  const activeIds = indicatorLayerIds.map(String);
  const layerIdx = activeIds.indexOf(layer.id.toString());

  const isFirst = indicatorLayerIds[0]?.toString() === layer.id.toString();
  const allLayers = useSelector(
    // @ts-ignore
    (state) => state.dashboard.data?.indicatorLayers,
  );
  const indicatorLayersOptions = useSelector(getIndicatorLayersOptions);

  const suffix = !compareMode ? "" : isFirst ? " (Outline)" : " (Inner)";
  const options = indicatorLayersOptions.map((opt) => {
    const id = opt.id.toString();
    if (id === layer.id.toString()) {
      return { ...opt, label: "[current] " + opt.label };
    }
    if (activeIds.includes(id)) {
      return { ...opt, label: "[switch] " + opt.label };
    }
    return opt;
  });
  options.sort((a, b) => a.label.localeCompare(b.label));
  const value = options.find((opt) => opt.id === layer.id);

  // This is for composite index layer
  if (layer.id < 0) {
    return <>{layer.name}</>;
  }
  return (
    <>
      <Select
        menuPortalTarget={document.body}
        menuPosition="fixed"
        className="FitContent"
        classNames={{ menuPortal: () => "FitContent" }}
        options={options}
        value={
          value
            ? {
                ...value,
                label: value.label.replace("[current] ", "") + suffix,
              }
            : null
        }
        getOptionValue={(opt: any) => opt.id}
        name="indicator_layer"
        onChange={(evt: any) => {
          const selectedId = evt.id.toString();
          if (selectedId === layer.id.toString()) return;
          if (evt.label.includes("[switch]")) {
            const targetIdx = activeIds.indexOf(selectedId);
            dispatch(Actions.Map.switchIndicatorLayers(layerIdx, targetIdx));
          } else {
            const newLayer = allLayers?.find(
              (l: any) => l.id.toString() === selectedId,
            );
            if (!newLayer) return;
            dispatch(Actions.Map.updateIndicatorLayerAtIdx(layerIdx, newLayer));
          }
        }}
      />
    </>
  );
};

/** Render indicator legend section */
const RenderIndicatorLegendSection = ({
  rules,
  name,
  layer,
}: {
  rules: any;
  name?: string;
  layer: IndicatorLayer;
}) => {
  return (
    <>
      <div className="MapLegendSectionTitle">
        {name ? <>{name}</> : <RenderIndicatorLegendName layer={layer} />}
      </div>
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
    </>
  );
};
/**
 * Render indicator legend
 */
const RenderIndicatorLegend = ({ layer }: { layer: IndicatorLayer }) => {
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
    return (
      <div className="MapLegendSection">
        <div className="MapLegendSectionTitle">
          <RenderIndicatorLegendName layer={layer} />
        </div>
        {layer.indicators.map((indicator) => {
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
            <RenderIndicatorLegendSection
              rules={rules}
              name={indicator.name}
              layer={layer}
            />
          );
        })}
      </div>
    );
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
  return (
    <div className="MapLegendSection">
      <RenderIndicatorLegendSection rules={rules} layer={layer} name={null} />
    </div>
  );
};

export interface Props {
  firstLayer: IndicatorLayer;
  secondLayer: IndicatorLayer;
}

/** Map Legend. */
export default function MapLegend({ firstLayer, secondLayer }: Props) {
  // @ts-ignore
  const indicatorShow = useSelector((state) => state.map?.indicatorShow);

  return (
    <>
      <div className="MapLegend">
        <div className="MapLegendContent Fullscreen">
          {firstLayer?.id && indicatorShow && (
            <RenderIndicatorLegend layer={firstLayer} />
          )}
          {secondLayer?.id && indicatorShow && (
            <div style={{ position: "relative" }}>
              <MapLegendSwitcher
                firstLayer={firstLayer}
                secondLayer={secondLayer}
              />
              <RenderIndicatorLegend layer={secondLayer} />
            </div>
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
