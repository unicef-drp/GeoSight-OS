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
 * __date__ = '09/04/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */

import React, { useState } from "react";
import { useSelector } from "react-redux";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { Checkbox } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { IndicatorLayer } from "../../../../types/IndicatorLayer";
import Highlighted from "../Highlighted";
import LayerDescription from "../Description";
import SidePanelSlicers from "../SidePanelSlicers";
import { RelatedTableLayerFilter } from "../../../../pages/Dashboard/LeftPanel/IndicatorLayers/RelatedTableLayer";
import {
  CompositeIndexLayerType,
  DynamicIndicatorType,
  RelatedTableLayerType,
} from "../../../../utils/indicatorLayer";
import { DynamicIndicatorLayerConfig } from "../../../../pages/Dashboard/LeftPanel/IndicatorLayers/DynamicIndicatorLayer";
import { Checker, RelatedTableChecker } from "./Checker";
import { isEligibleForCompositeLayer } from "../../../IndicatorLayer/CompositeIndexLayer/utilities";

export interface Props {
  layer?: IndicatorLayer;

  // Parent props
  nodesDataId: string;
  checked: boolean;
  selected: string[];
  filterText: string;
  maxWord: number;
  maxSelect: number;
  selectItem: (e: React.ChangeEvent<HTMLInputElement>) => void;

  otherElement?: React.ReactNode;
}

export default function IndicatorLayer({
  layer,
  nodesDataId,
  checked,
  selected,
  filterText,
  maxWord,
  selectItem,
  maxSelect,
  otherElement = null,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const disabled = !!(error ? error : layer.error);
  // @ts-ignore
  const compositeMode = useSelector((state) => state.mapMode.compositeMode);
  const isDisabled =
    disabled || (compositeMode && !isEligibleForCompositeLayer(layer));

  // When the indicator layer type selected
  const IndicatorLayerTypeSelection = () => {
    switch (layer.type) {
      case RelatedTableLayerType:
        return (
          <RelatedTableChecker
            layer={layer}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        );
        break;
      default:
        return (
          <Checker
            layer={layer}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        );
    }
  };

  const OtherData = () => {
    if (layer.related_tables?.length && layer.config.where) {
      return <RelatedTableLayerFilter relatedTableLayer={layer} />;
    } else if (layer.type === DynamicIndicatorType) {
      return <DynamicIndicatorLayerConfig indicatorLayer={layer} />;
    }
    return null;
  };

  return (
    <div>
      <FormControlLabel
        className={isDisabled ? " Disabled" : ""}
        control={
          <div
            className={"PanelInput"}
            title={
              isDisabled && compositeMode
                ? "This indicator layer is not eligible in composite mode"
                : ""
            }
          >
            {maxSelect >= 2 ? (
              <Checkbox
                tabIndex={-1}
                className="PanelCheckbox"
                size={"small"}
                disabled={isDisabled}
                value={nodesDataId}
                checked={checked}
                onChange={selectItem}
              />
            ) : (
              <Radio
                tabIndex={-1}
                className="PanelRadio"
                size={"small"}
                disabled={isDisabled}
                value={nodesDataId}
                checked={checked}
                onChange={selectItem}
              />
            )}
            {isLoading ? <CircularProgress /> : null}
          </div>
        }
        label={
          <span>
            {
              // @ts-ignore
              <Highlighted
                text={layer.name.replace(
                  new RegExp(`(\\w{${maxWord}})(?=\\w)`),
                  "$1",
                )}
                highlight={filterText}
                isGroup={false}
              />
            }
            {layer.type !== CompositeIndexLayerType && (
              // @ts-ignore
              <LayerDescription
                // @ts-ignore
                layer={{ ...layer, error: error ? error : layer.error }}
              />
            )}
            {!isDisabled && <>{OtherData()}</>}
            {otherElement}
          </span>
        }
      />
      {layer.related_table && selected.indexOf(nodesDataId) >= 0 ? (
        <SidePanelSlicers data={layer} />
      ) : null}
      <IndicatorLayerTypeSelection />
    </div>
  );
}
